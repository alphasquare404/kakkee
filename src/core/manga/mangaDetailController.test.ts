import { describe, expect, it, vi } from 'vitest';
import { createMangaDetailController } from './mangaDetailController';
import type { MangaDetailPage, MangaRepository } from './mangaRepository';

function chapter(id: number) {
  return {
    __typename: 'ChapterType' as const,
    id,
    name: `Chapter ${id}`,
    chapterNumber: id,
    pageCount: 10,
    isRead: false,
    isBookmarked: false,
    isDownloaded: false,
    lastPageRead: 0,
    scanlator: null,
    uploadDate: '1',
    sourceOrder: id,
  };
}

function page(items = [chapter(2)]): MangaDetailPage {
  return {
    manga: {
      __typename: 'MangaType',
      id: 1,
      title: 'Manga',
      author: null,
      artist: null,
      description: null,
      status: 'ONGOING',
      thumbnailUrl: null,
      thumbnailUrlLastFetched: null,
      genre: [],
      inLibrary: true,
      source: null,
    },
    chapters: items,
    totalCount: 2,
    pageInfo: { endCursor: 'next', hasNextPage: true },
  };
}

function setup() {
  const getDetail = vi.fn();
  const refresh = vi.fn();
  const setChapterRead = vi.fn();
  const setChapterBookmark = vi.fn();
  const setChaptersRead = vi.fn();
  const setChaptersBookmark = vi.fn();
  const enqueueDownload = vi.fn();
  const enqueueDownloads = vi.fn();
  const deleteDownloads = vi.fn();
  const deleteDownload = vi.fn();
  const setInLibrary = vi.fn();
  const repository = {
    getDetail,
    refresh,
    setChapterRead,
    setChapterBookmark,
    setChaptersRead,
    setChaptersBookmark,
    enqueueDownload,
    enqueueDownloads,
    deleteDownloads,
    deleteDownload,
    setInLibrary,
  } as unknown as MangaRepository;
  const controller = createMangaDetailController({ repository, mangaId: 1 });
  return {
    controller,
    getDetail,
    refresh,
    setChapterRead,
    setChapterBookmark,
    setChaptersRead,
    setChaptersBookmark,
    enqueueDownload,
    enqueueDownloads,
    deleteDownloads,
    deleteDownload,
    setInLibrary,
  };
}

describe('createMangaDetailController', () => {
  it('refreshes the source then reloads the detail page', async () => {
    const { controller, getDetail, refresh } = setup();
    getDetail.mockResolvedValue(page());
    refresh.mockResolvedValue(undefined);
    await controller.load();

    await controller.refresh();

    expect(refresh).toHaveBeenCalledWith(1);
    expect(getDetail).toHaveBeenCalledTimes(2);
  });

  it('loads and appends chapter pages without duplicates', async () => {
    const { controller, getDetail } = setup();
    getDetail.mockResolvedValueOnce(page([chapter(2)])).mockResolvedValueOnce(
      page([chapter(2), chapter(1)]),
    );

    await controller.load();
    expect(controller.getState().chapters.map((item) => item.id)).toEqual([2]);

    await controller.loadMore();
    expect(controller.getState().chapters.map((item) => item.id)).toEqual([2, 1]);
    expect(controller.getState().isLoadingMore).toBe(false);
  });

  it('resets chapters when order changes', async () => {
    const { controller, getDetail } = setup();
    getDetail.mockResolvedValue(page([chapter(2)]));

    await controller.load();
    await controller.setOrder('oldest');

    expect(controller.getState().order).toBe('oldest');
    expect(getDetail).toHaveBeenLastCalledWith(
      expect.objectContaining({
        order: 'oldest',
      }),
    );
    expect(controller.getState().chapters).toHaveLength(1);
  });

  it('preserves existing chapters on load-more error', async () => {
    const { controller, getDetail } = setup();
    const error = new Error('next page failed');
    getDetail.mockResolvedValueOnce(page([chapter(2)])).mockRejectedValueOnce(error);

    await controller.load();
    await controller.loadMore();

    expect(controller.getState().chapters.map((item) => item.id)).toEqual([2]);
    expect(controller.getState().loadMoreError).toBe(error);
  });

  it('exposes an initial error', async () => {
    const { controller, getDetail } = setup();
    const error = new Error('detail failed');
    getDetail.mockRejectedValueOnce(error);

    await controller.load();

    expect(controller.getState().error).toBe(error);
    expect(controller.getState().isLoading).toBe(false);
  });

  it('updates one chapter read state without reloading the page', async () => {
    const { controller, getDetail, setChapterRead } = setup();
    getDetail.mockResolvedValue(page([chapter(2)]));
    setChapterRead.mockResolvedValue(undefined);
    await controller.load();

    await controller.setChapterRead(2, true);

    expect(setChapterRead).toHaveBeenCalledWith(2, true);
    expect(controller.getState().chapters[0]?.isRead).toBe(true);
    expect(getDetail).toHaveBeenCalledTimes(1);
  });

  it('applies bulk read and bookmark patches to the chapter page', async () => {
    const { controller, getDetail, setChaptersRead, setChaptersBookmark } = setup();
    getDetail.mockResolvedValue(page([chapter(2), chapter(1)]));
    setChaptersRead.mockResolvedValue(undefined);
    setChaptersBookmark.mockResolvedValue(undefined);
    await controller.load();

    await controller.setChaptersRead([2], true);
    await controller.setChaptersBookmark([1, 2], true);

    expect(setChaptersRead).toHaveBeenCalledWith([2], true);
    expect(setChaptersBookmark).toHaveBeenCalledWith([1, 2], true);
    expect(controller.getState().chapters[0]?.isBookmarked).toBe(true);
    expect(controller.getState().chapters[0]?.isRead).toBe(true);
  });

  it('queues and deletes bulk chapter downloads', async () => {
    const { controller, getDetail, enqueueDownloads, deleteDownloads } = setup();
    getDetail.mockResolvedValue(page([chapter(2)]));
    enqueueDownloads.mockResolvedValue(undefined);
    deleteDownloads.mockResolvedValue(undefined);
    await controller.load();

    await controller.enqueueChapterDownloads([2]);
    await controller.deleteChapterDownloads([2]);

    expect(enqueueDownloads).toHaveBeenCalledWith([2]);
    expect(deleteDownloads).toHaveBeenCalledWith([2]);
    expect(controller.getState().chapters[0]?.isDownloaded).toBe(false);
  });

  it('updates bookmark and download state', async () => {    const {
      controller,
      getDetail,
      setChapterBookmark,
      enqueueDownload,
      deleteDownload,
    } = setup();
    getDetail.mockResolvedValue(page([chapter(2)]));
    setChapterBookmark.mockResolvedValue(undefined);
    enqueueDownload.mockResolvedValue(undefined);
    deleteDownload.mockResolvedValue(undefined);
    await controller.load();

    await controller.setChapterBookmark(2, true);
    await controller.setChapterDownloaded(2, false);
    await controller.setChapterDownloaded(2, true);

    expect(setChapterBookmark).toHaveBeenCalledWith(2, true);
    expect(enqueueDownload).toHaveBeenCalledWith(2);
    expect(deleteDownload).toHaveBeenCalledWith(2);
    expect(controller.getState().chapters[0]?.isBookmarked).toBe(true);
    expect(controller.getState().chapters[0]?.isDownloaded).toBe(false);
  });

  it('updates the in-library flag after the mutation succeeds', async () => {    const { controller, getDetail, setInLibrary } = setup();
    getDetail.mockResolvedValue(page());
    setInLibrary.mockResolvedValue(undefined);
    await controller.load();

    await controller.setInLibrary(false);

    expect(setInLibrary).toHaveBeenCalledWith(1, false);
    expect(controller.getState().manga?.inLibrary).toBe(false);
  });
});
