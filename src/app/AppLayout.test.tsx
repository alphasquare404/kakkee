// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from './AppLayout';
import { ConnectionProvider } from './ConnectionProvider';
import {
  FakeConnectionCoordinator,
  makeConnectedState,
} from '../test/fakeConnectionCoordinator';
import { createSectionOrigin } from './navigationOrigin';

vi.mock('../shared/useNavigationBadges', () => ({
  useNavigationBadges: () => ({ downloads: 0, extensionUpdates: 0 }),
}));

afterEach(() => {
  cleanup();
});

function renderShell(path: string, basename = '/', state?: unknown) {
  const coordinator = new FakeConnectionCoordinator(makeConnectedState());

  return render(
    <ConnectionProvider createCoordinator={() => coordinator}>
      <MemoryRouter
        basename={basename}
        initialEntries={[state === undefined ? path : { pathname: path, state }]}
      >
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="*" element={<div>Page content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ConnectionProvider>,
  );
}

function activeLabels() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.getAttribute('aria-label'));
}

describe('AppLayout navigation', () => {
  it('keeps Browse active on a source route', () => {
    renderShell('/browse/123');

    expect(activeLabels()).toContain('Browse');
  });

  it('keeps Browse active under a deployment basename', () => {
    renderShell('/app/browse/123', '/app');

    expect(activeLabels()).toContain('Browse');
  });

  it('keeps Browse active on merged search and extension routes', () => {
    renderShell('/search');
    expect(activeLabels()).toContain('Browse');

    cleanup();
    renderShell('/extensions/eu.kanade.tachiyomi.extension.all.example');
    expect(activeLabels()).toContain('Browse');
  });

  it('keeps Settings active on the About route', () => {
    renderShell('/about');

    expect(activeLabels()).toContain('Settings');
  });

  it('uses origin context for Manga Detail active navigation', () => {
    renderShell('/manga/427', '/', {
      origin: createSectionOrigin('browse', {
        pathname: '/browse/7',
        search: '?q=one',
      }),
    });

    expect(activeLabels()).toContain('Browse');
    expect(activeLabels()).not.toContain('Library');
  });

  it('does not invent a primary active item for a direct Manga URL', () => {
    renderShell('/manga/427');

    expect(activeLabels()).toEqual([]);
  });

  it('does not expose Search or Extensions as separate navigation tabs', () => {
    renderShell('/library');

    expect(screen.queryByRole('link', { name: 'Search' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Extensions' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Downloads' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Settings' }).length).toBeGreaterThan(0);
  });

});
