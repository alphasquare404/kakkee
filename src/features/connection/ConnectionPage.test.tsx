// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
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

describe('ConnectionPage disconnected', () => {
  it('renders the server form and submits the entered URL', async () => {
    const user = userEvent.setup();
    const coordinator = renderPage();

    expect(screen.getByRole('heading', { name: 'Suwayomi' })).toBeTruthy();
    const input = screen.getByLabelText('Alamat server Suwayomi');

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

    expect(screen.getByRole('heading', { name: 'Menghubungkan…' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Connect' })).toBeNull();
  });
});

describe('ConnectionPage login', () => {
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
      'Username atau password tidak cocok.',
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
        serverInfo: makeLoginRequiredState().serverInfo,
        compatibility: makeLoginRequiredState().compatibility,
      });
    });

    expect(screen.getByRole('heading', { name: 'Memverifikasi login…' })).toBeTruthy();
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

  it('shows a clear message and no Basic password form when auth is unsupported', () => {
    renderPage({
      status: 'unsupported-auth',
      authMode: 'BASIC_AUTH',
      error: new ConnectionError('unsupported-auth', 'basic-challenge'),
    });

    expect(screen.getByRole('heading', { name: 'Mode autentikasi belum didukung' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('BASIC_AUTH');
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

    expect(screen.getByRole('heading', { name: 'Koneksi gagal' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'Server mengembalikan error yang tidak dapat diproses.',
    );
    expect(screen.queryByText(/raw-stack/)).toBeNull();
  });

  it('maps an invalid URL error to a clear form message', () => {
    renderPage({
      status: 'failed',
      error: new ConnectionError('invalid-server-url'),
    });

    expect(screen.getByRole('alert').textContent).toContain('Alamat server tidak valid');
  });
});
