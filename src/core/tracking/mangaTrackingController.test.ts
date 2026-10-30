import { describe, expect, it, vi } from 'vitest';
import { createMangaTrackingController } from './mangaTrackingController';
import type { MangaTrackingRepository } from './mangaTrackingRepository';

const record = {
  __typename: 'TrackRecordType' as const,
  id: 9,
  trackerId: 1,
  title: 'One Piece',
  status: 1,
  score: 0,
  displayScore: '',
  private: false,
  remoteUrl: 'https://example.test/manga/1',
  tracker: {
    __typename: 'TrackerType' as const,
    id: 1,
    name: 'MAL',
    scores: ['0', '5', '10'],
    statuses: [{ __typename: 'TrackStatusType' as const, name: 'Reading', value: 1 }],
  },
};

function setup() {
  const getRecords = vi.fn(async () => [record]);
  const getTrackers = vi.fn(async () => [
    {
      __typename: 'TrackerType' as const,
      id: 1,
      name: 'MAL',
      icon: 'mal',
      isLoggedIn: true,
      isTokenExpired: false,
      authUrl: null,
      supportsPrivateTracking: true,
      supportsReadingDates: true,
      supportsTrackDeletion: true,
    },
  ]);
  const search = vi.fn(async () => [
    {
      __typename: 'TrackSearchType' as const,
      id: 3,
      remoteId: 'remote-1',
      trackerId: 1,
      title: 'One Piece',
      coverUrl: '',
      summary: '',
      totalChapters: 100,
      publishingStatus: 'Publishing',
      publishingType: 'Manga',
      score: 0,
      displayScore: '',
      status: 1,
    },
  ]);
  const bind = vi.fn(async () => record);
  const unbind = vi.fn(async () => undefined);
  const syncProgress = vi.fn(async () => [record]);
  const update = vi.fn(async () => ({
    id: 9,
    status: 2,
    score: 8,
    displayScore: '8',
  }));
  const repository = {
    getRecords,
    getTrackers,
    search,
    bind,
    unbind,
    syncProgress,
    update,
  } as unknown as MangaTrackingRepository;
  return {
    controller: createMangaTrackingController(repository),
    search,
    bind,
    unbind,
    syncProgress,
    update,
  };
}

describe('createMangaTrackingController', () => {
  it('loads, updates, and unbinds a track record', async () => {
    const { controller, unbind, update } = setup();
    await controller.load(1);
    await controller.update(9, { status: 2 });
    await controller.unbind(9);

    expect(controller.getState().records).toHaveLength(0);
    expect(update).toHaveBeenCalledWith({ status: 2 }, 9);
    expect(unbind).toHaveBeenCalledWith(9);
  });

  it('searches and binds a remote record', async () => {
    const { controller, search, bind } = setup();
    await controller.load(1);
    await controller.search(1, 'One Piece');
    expect(controller.getState().searchResults).toHaveLength(1);

    await controller.bind(1, 'remote-1', true);

    expect(search).toHaveBeenCalledWith(1, 'One Piece');
    expect(bind).toHaveBeenCalledWith({
      mangaId: 1,
      trackerId: 1,
      remoteId: 'remote-1',
      private: true,
    });
    expect(controller.getState().records).toHaveLength(1);
  });

  it('syncs tracker progress', async () => {
    const { controller, syncProgress } = setup();
    await controller.load(1);
    await controller.syncProgress();

    expect(syncProgress).toHaveBeenCalledWith(1);
    expect(controller.getState().syncing).toBe(false);
  });
});
