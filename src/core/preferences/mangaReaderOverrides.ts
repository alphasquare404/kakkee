import type {
  ReaderDirection,
  ReaderFilter,
  ReaderMode,
  ReaderScale,
  ReaderSettings,
} from './readerSettings';

const STORAGE_KEY = 'suwayomi.manga-reader-overrides.v1';
const listeners = new Set<() => void>();

type ReaderOverrideFields = Pick<
  ReaderSettings,
  | 'mode'
  | 'widthRem'
  | 'gapPx'
  | 'background'
  | 'filter'
  | 'scale'
  | 'direction'
  | 'brightnessPct'
  | 'contrastPct'
  | 'saturationPct'
  | 'stretchSmallPages'
  | 'autoHideControls'
  | 'incognito'
>;

export type MangaReaderOverride = {
  -readonly [K in keyof ReaderOverrideFields]?: ReaderOverrideFields[K];
};

let state: Record<string, MangaReaderOverride> = load();

function load(): Record<string, MangaReaderOverride> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, MangaReaderOverride> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        if (
          value === 'vertical' ||
          value === 'webtoon' ||
          value === 'single' ||
          value === 'double' ||
          value === 'horizontal'
        ) {
          result[key] = { mode: value };
        }
        continue;
      }

      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        continue;
      }

      const item = value as MangaReaderOverride;
      const override: MangaReaderOverride = {};

      if (
        item.mode === 'vertical' ||
        item.mode === 'webtoon' ||
        item.mode === 'single' ||
        item.mode === 'double' ||
        item.mode === 'horizontal'
      ) {
        override.mode = item.mode;
      }
      if (typeof item.widthRem === 'number') {
        override.widthRem = Math.min(100, Math.max(42, item.widthRem));
      }
      if (typeof item.gapPx === 'number') {
        override.gapPx = Math.min(24, Math.max(0, item.gapPx));
      }
      if (
        typeof item.background === 'string' &&
        /^#[0-9a-f]{6}$/i.test(item.background)
      ) {
        override.background = item.background;
      }
      if (
        item.filter === 'original' ||
        item.filter === 'grayscale' ||
        item.filter === 'sepia' ||
        item.filter === 'invert' ||
        item.filter === 'contrast'
      ) {
        override.filter = item.filter;
      }
      if (
        item.scale === 'fit-width' ||
        item.scale === 'fit-height' ||
        item.scale === 'screen' ||
        item.scale === 'original'
      ) {
        override.scale = item.scale;
      }
      if (item.direction === 'ltr' || item.direction === 'rtl') {
        override.direction = item.direction;
      }
      if (typeof item.brightnessPct === 'number') {
        override.brightnessPct = Math.min(150, Math.max(50, item.brightnessPct));
      }
      if (typeof item.contrastPct === 'number') {
        override.contrastPct = Math.min(150, Math.max(50, item.contrastPct));
      }
      if (typeof item.saturationPct === 'number') {
        override.saturationPct = Math.min(200, Math.max(0, item.saturationPct));
      }
      if (typeof item.stretchSmallPages === 'boolean') {
        override.stretchSmallPages = item.stretchSmallPages;
      }
      if (typeof item.autoHideControls === 'boolean') {
        override.autoHideControls = item.autoHideControls;
      }
      if (typeof item.incognito === 'boolean') {
        override.incognito = item.incognito;
      }

      if (Object.keys(override).length > 0) {
        result[key] = override;
      }
    }

    return result;
  } catch {
    return {};
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep overrides in memory.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getMangaReaderOverride(
  mangaId: number,
): MangaReaderOverride | null {
  return state[String(mangaId)] ?? null;
}

export function getMangaReaderMode(mangaId: number): ReaderMode | null {
  return state[String(mangaId)]?.mode ?? null;
}

export function updateMangaReaderOverride(
  mangaId: number,
  patch: MangaReaderOverride,
): void {
  const key = String(mangaId);
  const current = state[key] ?? {};
  const next = { ...current, ...patch };

  for (const [field, value] of Object.entries(next)) {
    if (value === undefined || value === null) {
      delete next[field as keyof MangaReaderOverride];
    }
  }

  if (Object.keys(next).length === 0) {
    const copy = { ...state };
    delete copy[key];
    state = copy;
  } else {
    state = { ...state, [key]: next };
  }

  persist();
  notify();
}

export function setMangaReaderOverride(
  mangaId: number,
  override: MangaReaderOverride | null,
): void {
  const key = String(mangaId);

  if (override === null || Object.keys(override).length === 0) {
    const copy = { ...state };
    delete copy[key];
    state = copy;
  } else {
    state = { ...state, [key]: override };
  }

  persist();
  notify();
}

export function setMangaReaderMode(
  mangaId: number,
  mode: ReaderMode | null,
): void {
  if (mode === null) {
    updateMangaReaderOverride(mangaId, { mode: undefined });
  } else {
    updateMangaReaderOverride(mangaId, { mode });
  }
}

export function subscribeMangaReaderOverrides(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export type { ReaderDirection, ReaderFilter, ReaderScale };
