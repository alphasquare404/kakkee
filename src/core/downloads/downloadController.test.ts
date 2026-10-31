import { describe, expect, it, vi } from 'vitest';
import { createDownloadController } from './downloadController';
import type { DownloadRepository } from './downloadRepository';

function setup() {
  const getQueue = vi.fn(async () => ({
    state: 'STARTED' as const,
    queue: [],
  }));
  const setPaused = vi.fn(async () => undefined);
  const dequeue = vi.fn(async () => undefined);
  const dequeueMany = vi.fn(async () => undefined);
  const deleteDownloaded = vi.fn(async () => undefined);
  const repository = {
    getQueue,
    setPaused,
    dequeue,
    dequeueMany,
    deleteDownloaded,
  } as unknown as DownloadRepository;
  return {
    controller: createDownloadController(repository),
    getQueue,
    setPaused,
    dequeue,
    dequeueMany,
    deleteDownloaded,
  };
}

describe('DownloadController', () => {
  it('loads the queue and pauses a running downloader', async () => {
    const { controller, getQueue, setPaused } = setup();
    await controller.load();
    await controller.togglePaused();

    expect(getQueue).toHaveBeenCalled();
    expect(setPaused).toHaveBeenCalledWith(true);
    expect(controller.getState().queue?.state).toBe('STARTED');
  });

  it('exposes action errors without losing the queue', async () => {
    const { controller, dequeue } = setup();
    await controller.load();
    dequeue.mockRejectedValueOnce(new Error('dequeue failed'));

    await controller.dequeue(3);

    expect(controller.getState().queue).not.toBeNull();
    expect(controller.getState().actionError).toBeInstanceOf(Error);
    expect(controller.getState().isActing).toBe(false);
  });

  it('cancels a group of chapters', async () => {
    const { controller, dequeueMany } = setup();
    await controller.load();
    await controller.dequeueMany([3, 4]);

    expect(dequeueMany).toHaveBeenCalledWith([3, 4]);
    expect(controller.getState().isActing).toBe(false);
  });
});
