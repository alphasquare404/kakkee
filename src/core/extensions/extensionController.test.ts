import { describe, expect, it, vi } from 'vitest';
import { createExtensionController } from './extensionController';
import type { ExtensionRepository } from './extensionRepository';

function setup() {
  const getExtensions = vi.fn(async () => [
    {
      __typename: 'ExtensionType' as const,
      pkgName: 'example',
      name: 'Example',
      versionName: '1.0.0',
      lang: 'en',
      isInstalled: false,
      hasUpdate: false,
      isObsolete: false,
      iconUrl: '/icon.png',
      contentWarning: 'SAFE' as const,
      extensionStore: null,
    },
  ]);
  const refresh = vi.fn(async () => ({
    extensions: await getExtensions(),
    stores: [],
  }));
  const update = vi.fn(async () => [
    {
      pkgName: 'example',
      isInstalled: true,
      hasUpdate: false,
    },
  ]);
  const addStore = vi.fn(async () => ({
    name: 'Store',
    badgeLabel: 'Community',
    indexUrl: 'https://example.test/index.json',
  }));
  const removeStore = vi.fn(async () => undefined);
  const repository = {
    getExtensions,
    refresh,
    update,
    addStore,
    removeStore,
  } as unknown as ExtensionRepository;
  return {
    controller: createExtensionController(repository),
    getExtensions,
    refresh,
    update,
    addStore,
    removeStore,
  };
}

describe('createExtensionController', () => {
  it('loads, refreshes, and installs an extension', async () => {
    const { controller, update } = setup();
    await controller.load();
    await controller.refresh();
    await controller.update('example', { install: true });

    expect(controller.getState().items[0]?.isInstalled).toBe(true);
    expect(update).toHaveBeenCalledWith('example', { install: true });
  });

  it('reports action failures without discarding the list', async () => {
    const { controller, update } = setup();
    await controller.load();
    update.mockRejectedValueOnce(new Error('rejected'));

    await controller.update('example', { install: true });

    expect(controller.getState().actionError).toBe(true);
    expect(controller.getState().items).toHaveLength(1);
  });

  it('adds and removes extension stores', async () => {
    const { controller, addStore, removeStore } = setup();
    await controller.load();
    await controller.refresh();
    await controller.addStore('https://example.test/index.json');

    expect(controller.getState().stores).toHaveLength(1);
    await controller.removeStore('https://example.test/index.json');

    expect(controller.getState().stores).toHaveLength(0);
    expect(addStore).toHaveBeenCalledWith('https://example.test/index.json');
    expect(removeStore).toHaveBeenCalledWith('https://example.test/index.json');
  });
});
