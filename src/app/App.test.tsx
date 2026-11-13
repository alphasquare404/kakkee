// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import {
  FakeConnectionCoordinator,
  makeConnectedState,
} from '../test/fakeConnectionCoordinator';

vi.mock('./pwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

describe('App', () => {
  it('renders the connection screen at the root route', () => {
    const coordinator = new FakeConnectionCoordinator();

    render(<App createCoordinator={() => coordinator} />);

    expect(screen.getByRole('heading', { name: 'Kakkee' })).toBeTruthy();
    expect(screen.getByLabelText('Suwayomi server address')).toBeTruthy();
  });

  it('respects a frontend base path for a subpath deployment', () => {
    const coordinator = new FakeConnectionCoordinator();
    window.history.replaceState({}, '', '/app/');

    render(
      <App
        frontendBasePath="/app/"
        createCoordinator={() => coordinator}
      />,
    );

    expect(screen.getByLabelText('Suwayomi server address')).toBeTruthy();
    expect(window.location.pathname).toBe('/app/');
  });

  it('returns an unknown deep link to the connection screen', async () => {
    const coordinator = new FakeConnectionCoordinator();
    window.history.replaceState({}, '', '/app/unknown/deep-link');

    render(
      <App
        frontendBasePath="/app/"
        createCoordinator={() => coordinator}
      />,
    );

    await waitFor(() => expect(window.location.pathname).toBe('/app'));
    expect(screen.getByLabelText('Suwayomi server address')).toBeTruthy();
  });

  it('returns a protected page to the connection screen when disconnected', async () => {
    const coordinator = new FakeConnectionCoordinator();
    window.history.replaceState({}, '', '/browse');

    render(<App createCoordinator={() => coordinator} />);

    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(screen.getByLabelText('Suwayomi server address')).toBeTruthy();
  });

  it('returns to the intended protected route after connecting', async () => {
    const coordinator = new FakeConnectionCoordinator();
    window.history.replaceState({}, '', '/settings');

    render(<App createCoordinator={() => coordinator} />);

    await waitFor(() => expect(window.location.pathname).toBe('/'));

    act(() => {
      coordinator.emit(makeConnectedState());
    });

    await waitFor(() => expect(window.location.pathname).toBe('/settings'));
  });
});
