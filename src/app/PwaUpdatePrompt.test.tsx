// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';

const pwaState = vi.hoisted(() => ({
  needRefresh: false,
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
  pwaState.needRefresh = false;
  pwaState.offlineReady = false;
  pwaState.updateServiceWorker.mockClear();
  window.sessionStorage.clear();
});

describe('PwaUpdatePrompt', () => {
  it('updates automatically without showing a dialog or buttons', async () => {
    pwaState.needRefresh = true;
    const { container } = render(<PwaUpdatePrompt />);

    await waitFor(() => {
      expect(pwaState.updateServiceWorker).toHaveBeenCalledWith(true);
    });
    expect(container.children).toHaveLength(0);
    expect(screen.queryByRole('button')).toBeNull();
    expect(window.sessionStorage.getItem('kakkee.pwa.updated.v1')).toBe('1');
  });

  it('shows a completion notice after the automatic update', () => {
    window.sessionStorage.setItem('kakkee.pwa.updated.v1', '1');
    render(<PwaUpdatePrompt />);

    expect(
      screen.getByText('Kakkee updated to the latest version.'),
    ).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders nothing when there is no update or completion notice', () => {
    const { container } = render(<PwaUpdatePrompt />);

    expect(container.children).toHaveLength(0);
  });
});
