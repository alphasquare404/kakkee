import { describe, expect, it, vi } from 'vitest';
import { createSyncController } from './syncController';
import type { SyncRepository } from './syncRepository';

const settings = {
  __typename: 'SettingsType' as const,
  syncInterval: 'P1D',
  syncDataCategories: true,
  syncDataChapters: false,
  syncDataHistory: true,
  syncDataManga: true,
  syncDataTracking: false,
  syncYomiEnabled: true,
  syncYomiHost: 'https://yomi.example',
};

function setup() {
  const getSettings = vi.fn(async () => settings);
  const update = vi.fn(async () => undefined);
  const start = vi.fn(async () => 'SUCCESS' as const);
  const repository = { getSettings, update, start } as unknown as SyncRepository;
  return { controller: createSyncController(repository), getSettings, update, start };
}

describe('createSyncController', () => {
  it('loads, updates, and starts sync', async () => {
    const { controller, update, start } = setup();
    await controller.load();
    await controller.update({ syncDataChapters: true });
    await controller.start();

    expect(controller.getState().settings?.syncDataChapters).toBe(true);
    expect(controller.getState().result).toBe('SUCCESS');
    expect(update).toHaveBeenCalledWith({ syncDataChapters: true });
    expect(start).toHaveBeenCalled();
  });
});
