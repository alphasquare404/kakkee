// @vitest-environment jsdom

import type { ApolloClient } from '@apollo/client';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import type { AboutPageQuery } from '../../core/graphql/generated/graphql';
import {
  FakeConnectionCoordinator,
  makeConnectedState,
} from '../../test/fakeConnectionCoordinator';

vi.mock('../../app/pwaUpdate', () => ({
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

function aboutData(): AboutPageQuery {
  return {
    __typename: 'Query',
    aboutServer: {
      __typename: 'AboutServerPayload',
      name: 'Suwayomi-Server',
      version: 'v2.4.2366',
      buildType: 'Stable',
      buildTime: '1700000000000',
    },
    aboutWebUI: {
      __typename: 'AboutWebUI',
      channel: 'STABLE',
      tag: 'v20260929.01',
      updateTimestamp: '1700000000000',
    },
    checkForWebUIUpdate: {
      __typename: 'WebUIUpdateCheck',
      updateAvailable: false,
      tag: 'v20260929.01',
    },
  } as unknown as AboutPageQuery;
}

describe('AboutPage navigation', () => {
  it('renders from a direct /about deep link and links back to Settings', async () => {
    const connected = makeConnectedState();
    const state = {
      ...connected,
      context: {
        ...connected.context,
        graphQL: {
          query: vi.fn(async () => ({ data: aboutData() })),
        } as unknown as ApolloClient,
      },
    };
    window.history.replaceState({}, '', '/about');
    const coordinator = new FakeConnectionCoordinator(state);

    render(<App createCoordinator={() => coordinator} />);

    expect(await screen.findByRole('heading', { name: 'About' })).toBeTruthy();
    expect(screen.getByText('Suwayomi-Server')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Back' }).getAttribute('href'),
    ).toBe('/settings');
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('link', { name: 'Settings' })
          .some((link) => link.getAttribute('aria-current') === 'page'),
      ).toBe(true),
    );
  });
});
