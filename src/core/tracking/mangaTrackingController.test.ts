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
  const unbind = vi.fn(async () => undefined);
  const update = vi.fn(async () => ({
    id: 9,
    status: 2,
    score: 8,
    displayScore: '8',
  }));
  const repository = {
    getRecords,
    unbind,
    update,
  } as unknown as MangaTrackingRepository;
  return { controller: createMangaTrackingController(repository), unbind, update };
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
});
