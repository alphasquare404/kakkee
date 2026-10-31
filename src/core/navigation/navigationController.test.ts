import { describe, expect, it, vi } from 'vitest';
import { createNavigationController } from './navigationController';

describe('createNavigationController', () => {
  it('loads badges and keeps the last values on failure', async () => {
    const getBadges = vi.fn(async () => ({ downloads: 2, extensionUpdates: 1 }));
    const controller = createNavigationController({ getBadges });

    await controller.load();
    expect(controller.getState()).toEqual({ downloads: 2, extensionUpdates: 1 });

    getBadges.mockRejectedValueOnce(new Error('offline'));
    await controller.load();
    expect(controller.getState()).toEqual({ downloads: 2, extensionUpdates: 1 });
  });
});
