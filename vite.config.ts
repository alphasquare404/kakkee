import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { normalizeFrontendBasePath } from './src/core/config/deployment.ts';
import { createPwaManifest, createPwaWorkbox } from './src/app/pwaConfig.ts';

function readFrontendBasePath(configured: string | undefined): string {
  if (!configured) {
    return '/';
  }

  try {
    return normalizeFrontendBasePath(configured);
  } catch {
    return '/';
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const frontendBasePath = readFrontendBasePath(env.VITE_FRONTEND_BASE_PATH);

  return {
    base: frontendBasePath,
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        includeAssets: [
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/icon-512-maskable.png',
          'icons/apple-touch-icon.png',
          'icons/favicon-32.png',
        ],
        includeManifestIcons: false,
        manifest: createPwaManifest(frontendBasePath),
        workbox: createPwaWorkbox(frontendBasePath),
      }),
    ],
    build: {
      outDir: 'dist',
    },
  };
});
