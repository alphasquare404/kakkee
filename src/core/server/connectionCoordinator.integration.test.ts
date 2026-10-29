import { describe, expect, it } from 'vitest';
import {
  createConnectionCoordinator,
  type ConnectionState,
} from './connectionCoordinator';

const noneUrl = import.meta.env.VITE_RUNTIME_NONE_URL;
const uiUrl = import.meta.env.VITE_RUNTIME_UI_URL;
const basicUrl = import.meta.env.VITE_RUNTIME_BASIC_URL;
const uiPassword = import.meta.env.VITE_RUNTIME_UI_PASSWORD;
const hasRuntime = Boolean(noneUrl && uiUrl && basicUrl && uiPassword);
const describeRuntime = hasRuntime ? describe : describe.skip;

function connected(state: ConnectionState) {
  if (state.status !== 'connected') {
    throw new Error(`Expected connected, received ${state.status}.`);
  }

  return state;
}

function createCoordinator() {
  return createConnectionCoordinator({
    frontendUrl: 'http://127.0.0.1/',
    frontendBasePath: '/',
  });
}

describeRuntime('stable v2.4.2366 connection coordinator', () => {
  it('NONE: aboutServer and protected probe reach connected without credentials', async () => {
    const coordinator = createCoordinator();

    try {
      await coordinator.connect(noneUrl!);
      const state = connected(coordinator.getState());

      expect(state.context.serverInfo.version).toBe('v2.4.2366');
      expect(state.context.serverInfo.buildType).toBe('Stable');
      expect(state.context.authMode).toBe('NONE');
      expect(state.context.compatibility.status).toBe('compatible');

      const image = await state.context.resources.loadImageResource('/api/v1/track/1/thumbnail');
      expect(image.blob.size).toBeGreaterThan(0);
      image.dispose();
    } finally {
      await coordinator.dispose();
    }
  });

  it('UI_LOGIN: login-required, wrong password, correct login, then connected', async () => {
    const coordinator = createCoordinator();

    try {
      await coordinator.connect(uiUrl!);
      const required = coordinator.getState();
      expect(required.status).toBe('login-required');
      if (required.status === 'login-required') {
        expect(required.authMode).toBe('UNKNOWN');
      }

      await coordinator.login('audit-admin', 'wrong-password');
      const invalid = coordinator.getState();
      expect(invalid.status).toBe('login-required');
      if (invalid.status === 'login-required') {
        expect(invalid.error?.code).toBe('invalid-credentials');
      }

      await coordinator.login('audit-admin', uiPassword!);
      const state = connected(coordinator.getState());

      expect(state.context.serverInfo.version).toBe('v2.4.2366');
      expect(state.context.authMode).toBe('UI_LOGIN');
      expect(state.context.compatibility.status).toBe('compatible');

      const image = await state.context.resources.loadImageResource('/api/v1/track/1/thumbnail');
      expect(image.blob.size).toBeGreaterThan(0);
      image.dispose();
    } finally {
      await coordinator.dispose();
    }
  });

  it('BASIC_AUTH: detects the Basic challenge and reports unsupported-auth', async () => {
    const coordinator = createCoordinator();

    try {
      await coordinator.connect(basicUrl!);
      const state = coordinator.getState();

      expect(state.status).toBe('unsupported-auth');
      if (state.status === 'unsupported-auth') {
        expect(state.authMode).toBe('BASIC_AUTH');
        expect(state.error.code).toBe('unsupported-auth');
      }
    } finally {
      await coordinator.dispose();
    }
  });
});
