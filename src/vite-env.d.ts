/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RUNTIME_NONE_URL?: string;
  readonly VITE_RUNTIME_UI_URL?: string;
  readonly VITE_RUNTIME_UI_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
