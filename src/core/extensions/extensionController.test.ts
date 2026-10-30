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
  const repository = {
    getExtensions,
    refresh,
    update,
  } as unknown as ExtensionRepository;
  return {
    controller: createExtensionController(repository),
    getExtensions,
    refresh,
    update,
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
});
