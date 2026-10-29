import { describe, expect, it } from 'vitest';
import { AuthService } from '../auth/authService';
import { createDeploymentConfig } from '../config/deployment';
import { createAuthTransport } from '../graphql/authTransport';
import { createResourceService } from './resourceService';

const noneUrl = import.meta.env.VITE_RUNTIME_NONE_URL;
const uiUrl = import.meta.env.VITE_RUNTIME_UI_URL;
const uiPassword = import.meta.env.VITE_RUNTIME_UI_PASSWORD;
const hasRuntime = Boolean(noneUrl && uiUrl && uiPassword);
const describeRuntime = hasRuntime ? describe : describe.skip;

function deployment(serverBaseUrl: string) {
  return createDeploymentConfig({
    frontendUrl: 'http://127.0.0.1/',
    frontendBasePath: '/',
    serverBaseUrl,
  });
}

function invalidToken(): string {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${encode(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${encode(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  )}.invalid-signature`;
}

describeRuntime('stable v2.4.2366 resource service', () => {
  it('NONE: loads a real tracker image over REST without Authorization', async () => {
    const authService = new AuthService();
    authService.setNoneSession();
    const service = createResourceService({
      config: deployment(noneUrl!),
      authService,
    });

    const resource = await service.loadImageResource('/api/v1/track/1/thumbnail');

    expect(resource.blob.size).toBeGreaterThan(0);
    expect(resource.contentType).toContain('image/png');
    expect(resource.objectUrl).toMatch(/^blob:/);
    resource.dispose();
    service.dispose();
  });

  it('UI_LOGIN: rejects an invalid Bearer and loads the same protected image with a valid login', async () => {
    const authService = new AuthService();
    const config = deployment(uiUrl!);
    const authTransport = createAuthTransport({
      graphqlHttpUrl: config.graphqlHttpUrl,
    });
    const service = createResourceService({ config, authService });

    authService.setUiLoginSession({
      accessToken: invalidToken(),
      refreshToken: 'invalid-refresh-token',
    });

    await expect(
      service.loadImageResource('/api/v1/track/1/thumbnail'),
    ).rejects.toMatchObject({ code: 'unauthorized' });

    const noTokenAuth = new AuthService();
    noTokenAuth.setNoneSession();
    const noTokenService = createResourceService({ config, authService: noTokenAuth });
    await expect(
      noTokenService.loadImageResource('/api/v1/track/1/thumbnail'),
    ).rejects.toMatchObject({ code: 'unauthorized' });
    noTokenService.dispose();

    const login = await authTransport.login({
      username: 'audit-admin',
      password: uiPassword!,
    });
    authService.setUiLoginSession(login);

    const resource = await service.loadImageResource('/api/v1/track/1/thumbnail');
    expect(resource.blob.size).toBeGreaterThan(0);
    expect(resource.contentType).toContain('image/png');
    resource.dispose();
    service.dispose();
  });
});
