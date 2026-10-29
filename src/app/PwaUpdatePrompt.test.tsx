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

    expect(screen.getByText(/Versi baru aplikasi tersedia/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Update dan reload' }));

    expect(pwaState.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('shows a dismissible shell-ready message without claiming offline data', () => {
    pwaState.needRefresh = false;
    pwaState.offlineReady = true;
    render(<PwaUpdatePrompt />);

    expect(screen.getByText(/Shell aplikasi siap dipakai/)).toBeTruthy();
    expect(screen.getByText(/Data server tetap memerlukan koneksi/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Update dan reload' })).toBeNull();
  });

  it('renders nothing when there is no update or offline-ready state', () => {
    pwaState.needRefresh = false;
    pwaState.offlineReady = false;
    const { container } = render(<PwaUpdatePrompt />);

    expect(container.children).toHaveLength(0);
  });
});
