// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearLastServerUrl } from '../../core/preferences/connectionPreferences';
import { ConnectionProvider } from '../../app/ConnectionProvider';
import { ConnectionError } from '../../core/server/connectionError';
import type { ConnectionState } from '../../core/server/connectionCoordinator';
import { ConnectionPage } from './ConnectionPage';
import {
  FakeConnectionCoordinator,
  makeConnectedState,
  makeLoginRequiredState,
} from '../../test/fakeConnectionCoordinator';

function renderPage(initialState: ConnectionState = { status: 'disconnected' }) {
  const coordinator = new FakeConnectionCoordinator(initialState);

  render(
    <MemoryRouter>
      <ConnectionProvider createCoordinator={() => coordinator}>
        <ConnectionPage />
      </ConnectionProvider>
    </MemoryRouter>,
  );

  return coordinator;
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
  clearLastServerUrl();
});

describe('ConnectionPage disconnected', () => {
  it('renders the server form and submits the entered URL', async () => {
    const user = userEvent.setup();
    const coordinator = renderPage();

    expect(screen.getByRole('heading', { name: 'Suwayomi' })).toBeTruthy();
    const input = screen.getByLabelText('Suwayomi server address');

    await user.type(input, 'https://manga.example.com/suwayomi');
    await user.click(screen.getByRole('button', { name: 'Connect' }));

    expect(coordinator.connectCalls).toEqual(['https://manga.example.com/suwayomi']);
  });

  it('prevents duplicate submission while connecting', () => {
    renderPage({
      status: 'connecting',
      serverBaseUrl: 'https://manga.example.com',
      config: makeLoginRequiredState().config,
    });

    expect(screen.getByRole('heading', { name: 'Connecting…' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Connect' })).toBeNull();
  });
});

describe('ConnectionPage login', () => {
  it('restores a remembered session with its refresh token', async () => {
    window.localStorage.setItem(
      'suwayomi.remembered-session.v1',
      JSON.stringify({
        serverUrl: 'https://server.example/suwayomi',
        refreshToken: 'remembered-refresh',
      }),
    );
    const coordinator = renderPage(makeLoginRequiredState());

    await waitFor(() =>
      expect(coordinator.restoreCalls).toEqual(['remembered-refresh']),
    );
  });

  it('submits HTTP Basic credentials through the Basic login path', async () => {
    const user = userEvent.setup();
    const coordinator = renderPage({
      ...makeLoginRequiredState(),
      authMode: 'BASIC_AUTH',
    });

    expect(
      screen.getByRole('heading', { name: 'Basic authentication' }),
    ).toBeTruthy();

    await user.type(screen.getByLabelText('Username'), 'reader');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(coordinator.basicLoginCalls).toEqual([
      { username: 'reader', password: 'secret' },
    ]);
    expect(coordinator.loginCalls).toEqual([]);
  });

  it('submits SIMPLE_LOGIN credentials through the session login path', async () => {
    const user = userEvent.setup();
    const coordinator = renderPage({
      ...makeLoginRequiredState(),
      authMode: 'SIMPLE_LOGIN',
    });

    expect(
      screen.getByRole('heading', { name: 'Server session login' }),
    ).toBeTruthy();

    await user.type(screen.getByLabelText('Username'), 'reader');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(coordinator.simpleLoginCalls).toEqual([
      { username: 'reader', password: 'secret' },
    ]);
    expect(coordinator.loginCalls).toEqual([]);
  });

  it('submits username/password, shows invalid credentials, and clears password', async () => {
    const user = userEvent.setup();
    const initial = makeLoginRequiredState();
    const coordinator = renderPage(initial);

    await user.type(screen.getByLabelText('Username'), 'reader');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(coordinator.loginCalls).toEqual([
      { username: 'reader', password: 'wrong-password' },
    ]);
    expect(screen.getByLabelText('Password')).toHaveProperty('value', '');

    act(() => {
      coordinator.emit(
        makeLoginRequiredState(new ConnectionError('invalid-credentials')),
      );
    });

    expect(screen.getByRole('alert').textContent).toContain(
      'Invalid username or password.',
    );
    expect(screen.getByLabelText('Username')).toHaveProperty('value', 'reader');
    expect(screen.getByLabelText('Password')).toHaveProperty('value', '');
    expect(screen.queryByDisplayValue('wrong-password')).toBeNull();
  });

  it('disables the login form while authenticating', () => {
    const coordinator = renderPage(makeLoginRequiredState());

    act(() => {
      coordinator.emit({
        status: 'authenticating',
        serverBaseUrl: 'https://server.example/suwayomi',
        config: makeLoginRequiredState().config,
        serverInfo: makeLoginRequiredState().serverInfo!,
        compatibility: makeLoginRequiredState().compatibility!,
      });
    });

    expect(screen.getByRole('heading', { name: 'Verifying login…' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Login' })).toBeNull();
  });

  it('keeps the username after a failed login and allows a retry', async () => {
    const user = userEvent.setup();
    const coordinator = renderPage(
      makeLoginRequiredState(new ConnectionError('invalid-credentials')),
    );

    expect(screen.getByLabelText('Username')).toHaveProperty('value', '');
    await user.type(screen.getByLabelText('Username'), 'reader');
    expect(screen.getByLabelText('Username')).toHaveProperty('value', 'reader');

    await user.type(screen.getByLabelText('Password'), 'another');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(coordinator.loginCalls[0]?.username).toBe('reader');
  });

  it('shows a clear message and no password form when auth cannot be negotiated', () => {
    renderPage({
      status: 'unsupported-auth',
      authMode: 'UNKNOWN',
      error: new ConnectionError('unsupported-auth', 'unknown-challenge'),
    });

    expect(screen.getByRole('heading', { name: 'Unsupported authentication mode' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'cannot prove or support',
    );
    expect(screen.queryByLabelText('Password')).toBeNull();
  });
});

describe('ConnectionPage connected', () => {
  it('shows server information, auth mode, compatibility warning, and disconnects', async () => {
    const user = userEvent.setup();
    const coordinator = renderPage(
      makeConnectedState({
        status: 'unknown',
        baseline: 'v2.4.2366',
        version: 'nightly',
        buildType: 'Stable',
        warning: 'Versi server tidak dapat diparse; hanya operasi baseline yang terbukti dijalankan.',
      }),
    );

    expect(screen.getByRole('heading', { name: 'Suwayomi-Server' })).toBeTruthy();
    expect(screen.getByText('https://server.example/suwayomi')).toBeTruthy();
    expect(screen.getByText('v2.4.2366')).toBeTruthy();
    expect(screen.getByText('Stable')).toBeTruthy();
    expect(screen.getByText('NONE')).toBeTruthy();
    expect(screen.getByText('Linux 6.0')).toBeTruthy();
    expect(screen.getByText('amd64')).toBeTruthy();
    expect(screen.getByText(/Versi server tidak dapat diparse/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Disconnect' }));
    expect(coordinator.disconnectCalls).toHaveLength(1);
  });

  it('maps a failed connection to human text without raw diagnostics', () => {
    renderPage({
      status: 'failed',
      error: new ConnectionError('server-error', 'java.lang.RuntimeException: raw-stack'),
    });

    expect(screen.getByRole('heading', { name: 'Connection failed' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'The server returned an error that could not be processed.',
    );
    expect(screen.queryByText(/raw-stack/)).toBeNull();
  });

  it('maps an invalid URL error to a clear form message', () => {
    renderPage({
      status: 'failed',
      error: new ConnectionError('invalid-server-url'),
    });

    expect(screen.getByRole('alert').textContent).toContain('Invalid server address');
  });
});
