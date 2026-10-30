import { describe, expect, it, vi } from 'vitest';
import { createTrackingController } from './trackingController';
import type { TrackingRepository } from './trackingRepository';

const tracker = {
  __typename: 'TrackerType' as const,
  id: 1,
  name: 'MAL',
  icon: 'mal',
  isLoggedIn: true,
  isTokenExpired: false,
  authUrl: 'https://example.test/auth',
  supportsPrivateTracking: true,
  supportsReadingDates: true,
  supportsTrackDeletion: true,
};

function setup() {
  const getTrackers = vi.fn(async () => [tracker]);
  const logout = vi.fn(async () => undefined);
  const repository = { getTrackers, logout } as unknown as TrackingRepository;
  return {
    controller: createTrackingController(repository),
    getTrackers,
    logout,
  };
}

describe('createTrackingController', () => {
  it('loads trackers and updates logged-in state after logout', async () => {
    const { controller, logout } = setup();
    await controller.load();
    await controller.logout(1);

    expect(controller.getState().items[0]?.isLoggedIn).toBe(false);
    expect(logout).toHaveBeenCalledWith(1);
  });
});
