import { describe, expect, it, vi } from 'vitest';
import { createReaderController } from './readerController';
import type { ReaderChapter, ReaderRepository } from './readerRepository';

const chapter: ReaderChapter = {
  __typename: 'ChapterType',
  id: 10,
  name: 'Chapter 10',
  pageCount: 2,
  chapterNumber: 10,
  sourceOrder: 10,
  isRead: false,
  lastPageRead: 0,
  manga: {
    __typename: 'MangaType',
    id: 1,
    title: 'Manga',
    thumbnailUrl: null,
  },
};

function setup() {
  const getChapter = vi.fn();
  const getNeighbors = vi.fn();
  const getChapterList = vi.fn(async () => []);
  const getPages = vi.fn();
  const updateProgress = vi.fn();
  const repository = {
    getChapter,
    getNeighbors,
    getChapterList,
    getPages,
    updateProgress,
  } as unknown as ReaderRepository;
  const controller = createReaderController({ repository });
  return {
    controller,
    getChapter,
    getNeighbors,
    getChapterList,
    getPages,
    updateProgress,
  };
}

describe('createReaderController', () => {
  it('loads chapter metadata, neighbors, and page paths', async () => {
    const { controller, getChapter, getNeighbors, getPages } = setup();
    getChapter.mockResolvedValue(chapter);
    getNeighbors.mockResolvedValue({
      previous: { nodes: [{ id: 9, name: 'Chapter 9', chapterNumber: 9 }] },
      next: { nodes: [{ id: 11, name: 'Chapter 11', chapterNumber: 11 }] },
    });
    getPages.mockResolvedValue(['/page/0', '/page/1']);

    await controller.load(10);

    expect(controller.getState()).toMatchObject({
      chapter,
      pages: ['/page/0', '/page/1'],
      previousChapter: { id: 9 },
      nextChapter: { id: 11 },
      isLoading: false,
      isLoadingPages: false,
      error: null,
      pagesError: null,
    });
  });

  it('keeps chapter metadata when pages fail and supports retry', async () => {
    const { controller, getChapter, getNeighbors, getPages } = setup();
    const pagesError = new Error('pages failed');
    getChapter.mockResolvedValue(chapter);
    getNeighbors.mockResolvedValue({
      previous: { nodes: [] },
      next: { nodes: [] },
    });
    getPages.mockRejectedValueOnce(pagesError).mockResolvedValueOnce(['/page/0']);

    await controller.load(10);
    expect(controller.getState().chapter).toBe(chapter);
    expect(controller.getState().pagesError).toBe(pagesError);

    await controller.retryPages();
    expect(controller.getState().pages).toEqual(['/page/0']);
    expect(controller.getState().pagesError).toBeNull();
  });

  it('saves progress and marks the chapter read on the last page', async () => {
    const { controller, getChapter, getNeighbors, getPages, updateProgress } = setup();
    getChapter.mockResolvedValue(chapter);
    getNeighbors.mockResolvedValue({ previous: { nodes: [] }, next: { nodes: [] } });
    getPages.mockResolvedValue(['/page/0', '/page/1']);
    await controller.load(10);

    await controller.saveProgress(10, 1, true);

    expect(updateProgress).toHaveBeenCalledWith(10, 1, true);
    expect(controller.getState().chapter).toMatchObject({ isRead: true, lastPageRead: 1 });
  });

  it('does not save progress after the reader moved to another chapter', async () => {
    const { controller, getChapter, getNeighbors, getPages, updateProgress } = setup();
    getChapter.mockResolvedValue(chapter);
    getNeighbors.mockResolvedValue({ previous: { nodes: [] }, next: { nodes: [] } });
    getPages.mockResolvedValue(['/page/0']);
    await controller.load(10);

    await controller.saveProgress(11, 1, false);

    expect(updateProgress).not.toHaveBeenCalled();
  });

  it('ignores stale chapter results', async () => {
    const { controller, getChapter, getNeighbors, getPages } = setup();
    let resolveFirst!: (value: ReaderChapter) => void;
    const first = new Promise<ReaderChapter>((resolve) => {
      resolveFirst = resolve;
    });
    getChapter.mockReturnValueOnce(first).mockResolvedValueOnce({
      ...chapter,
      id: 11,
      name: 'Chapter 11',
    });
    getNeighbors.mockResolvedValue({ previous: { nodes: [] }, next: { nodes: [] } });
    getPages.mockResolvedValue(['/page/0']);

    const oldLoad = controller.load(10);
    await controller.load(11);
    resolveFirst(chapter);
    await oldLoad;

    expect(controller.getState().chapter?.id).toBe(11);
  });
});
