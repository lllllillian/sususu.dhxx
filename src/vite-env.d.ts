/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIDEO_GENERATION_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
