// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';

const pwaState = vi.hoisted(() => ({
  needRefresh: true,
  offlineReady: false,
  updateServiceWorker: vi.fn(),
}));

vi.mock('./pwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: [pwaState.needRefresh, vi.fn()],
    offlineReady: [pwaState.offlineReady, vi.fn()],
    updateServiceWorker: pwaState.updateServiceWorker,
  }),
}));

afterEach(() => {
  cleanup();
  pwaState.needRefresh = true;
  pwaState.offlineReady = false;
  pwaState.updateServiceWorker.mockClear();
});

describe('PwaUpdatePrompt', () => {
  it('offers reload when a new shell version is waiting', async () => {
    const user = userEvent.setup();
    render(<PwaUpdatePrompt />);

    expect(screen.getByText(/A new version of the app is available/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Update and reload' }));

    expect(pwaState.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('does not show a technical shell-ready notice', () => {
    pwaState.needRefresh = false;
    pwaState.offlineReady = true;
    const { container } = render(<PwaUpdatePrompt />);

    expect(container.children).toHaveLength(0);
    expect(screen.queryByText(/app shell is ready/i)).toBeNull();
  });

  it('renders nothing when there is no update or offline-ready state', () => {
    pwaState.needRefresh = false;
    pwaState.offlineReady = false;
    const { container } = render(<PwaUpdatePrompt />);

    expect(container.children).toHaveLength(0);
  });
});
