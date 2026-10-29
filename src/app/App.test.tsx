// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { FakeConnectionCoordinator } from '../test/fakeConnectionCoordinator';

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

describe('App', () => {
  it('renders the connection screen at the root route', () => {
    const coordinator = new FakeConnectionCoordinator();

    render(<App createCoordinator={() => coordinator} />);

    expect(screen.getByRole('heading', { name: 'Suwayomi Frontend' })).toBeTruthy();
    expect(screen.getByLabelText('Alamat server Suwayomi')).toBeTruthy();
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

    expect(screen.getByLabelText('Alamat server Suwayomi')).toBeTruthy();
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
    expect(screen.getByLabelText('Alamat server Suwayomi')).toBeTruthy();
  });
});
