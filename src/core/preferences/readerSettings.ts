export type ReaderMode =
  | 'vertical'
  | 'webtoon'
  | 'single'
  | 'double'
  | 'horizontal';

export type ReaderFilter =
  | 'original'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'contrast';

export type ReaderScale = 'fit-width' | 'fit-height' | 'screen' | 'original';
export type ReaderDirection = 'ltr' | 'rtl';
export type ReaderKey = 'ArrowLeft' | 'ArrowRight' | 'PageUp' | 'PageDown' | 'Escape' | 'Backspace';

const READER_KEYS: readonly ReaderKey[] = [
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Escape',
  'Backspace',
];

function isReaderKey(value: unknown): value is ReaderKey {
  return typeof value === 'string' && READER_KEYS.includes(value as ReaderKey);
}

export const READER_FILTER_CSS: Record<ReaderFilter, string> = {
  original: 'none',
  grayscale: 'grayscale(1)',
  sepia: 'sepia(0.8)',
  invert: 'invert(1)',
  contrast: 'contrast(1.35)',
};

export function buildReaderFilter(settings: {
  readonly filter: ReaderFilter;
  readonly brightnessPct: number;
  readonly contrastPct: number;
  readonly saturationPct: number;
}): string {
  const preset = READER_FILTER_CSS[settings.filter];
  const parts = [
    ...(preset === 'none' ? [] : [preset]),
    `brightness(${settings.brightnessPct}%)`,
    `contrast(${settings.contrastPct}%)`,
    `saturate(${settings.saturationPct}%)`,
  ];

  return parts.join(' ');
}

export interface ReaderModeProfile {
  readonly widthRem: number;
  readonly gapPx: number;
  readonly background: string;
  readonly filter: ReaderFilter;
  readonly scale: ReaderScale;
  readonly direction: ReaderDirection;
}

export interface ReaderSettings {
  readonly widthRem: number;
  readonly gapPx: number;
  readonly background: string;
  readonly mode: ReaderMode;
  readonly filter: ReaderFilter;
  readonly brightnessPct: number;
  readonly contrastPct: number;
  readonly saturationPct: number;
  readonly stretchSmallPages: boolean;
  readonly scale: ReaderScale;
  readonly direction: ReaderDirection;
  readonly keepScreenOn: boolean;
  readonly firstPageOffset: number;
  readonly skipDuplicates: boolean;
  readonly autoAdvance: boolean;
  readonly autoDetectWebtoon: boolean;
  readonly autoHideControls: boolean;
  readonly incognito: boolean;
  readonly autoScrollSpeed: number;
  readonly pagePrevKey: ReaderKey;
  readonly pageNextKey: ReaderKey;
  readonly backKey: ReaderKey;
  readonly deleteAfterReading: boolean;
  readonly autoBackground: boolean;
  readonly profiles: Partial<Record<ReaderMode, ReaderModeProfile>>;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  widthRem: 62,
  gapPx: 2,
  background: '#05070c',
  mode: 'vertical',
  filter: 'original',
  brightnessPct: 100,
  contrastPct: 100,
  saturationPct: 100,
  stretchSmallPages: false,
  scale: 'fit-width',
  direction: 'ltr',
  keepScreenOn: false,
  firstPageOffset: 0,
  skipDuplicates: false,
  autoAdvance: false,
  autoDetectWebtoon: false,
  autoHideControls: true,
  incognito: false,
  autoScrollSpeed: 1,
  pagePrevKey: 'ArrowLeft',
  pageNextKey: 'ArrowRight',
  backKey: 'Escape',
  deleteAfterReading: false,
  autoBackground: false,
  profiles: {},
};

const STORAGE_KEY = 'suwayomi.reader-settings.v1';

let state: ReaderSettings = load();
const listeners = new Set<() => void>();

function load(): ReaderSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_READER_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;

    return {
      widthRem: clampNumber(parsed.widthRem, 42, 100, DEFAULT_READER_SETTINGS.widthRem),
      gapPx: clampNumber(parsed.gapPx, 0, 24, DEFAULT_READER_SETTINGS.gapPx),
      background:
        typeof parsed.background === 'string' &&
        /^#[0-9a-f]{6}$/i.test(parsed.background)
          ? parsed.background
          : DEFAULT_READER_SETTINGS.background,
      mode: isReaderMode(parsed.mode) ? parsed.mode : DEFAULT_READER_SETTINGS.mode,
      filter: isReaderFilter(parsed.filter)
        ? parsed.filter
        : DEFAULT_READER_SETTINGS.filter,
      brightnessPct: clampNumber(
        parsed.brightnessPct,
        50,
        150,
        DEFAULT_READER_SETTINGS.brightnessPct,
      ),
      contrastPct: clampNumber(
        parsed.contrastPct,
        50,
        150,
        DEFAULT_READER_SETTINGS.contrastPct,
      ),
      saturationPct: clampNumber(
        parsed.saturationPct,
        0,
        200,
        DEFAULT_READER_SETTINGS.saturationPct,
      ),
      stretchSmallPages: parsed.stretchSmallPages === true,
      scale: isReaderScale(parsed.scale)
        ? parsed.scale
        : DEFAULT_READER_SETTINGS.scale,
      direction:
        parsed.direction === 'rtl' ? 'rtl' : 'ltr',
      keepScreenOn: parsed.keepScreenOn === true,
      firstPageOffset: clampNumber(
        parsed.firstPageOffset,
        0,
        200,
        DEFAULT_READER_SETTINGS.firstPageOffset,
      ),
      skipDuplicates: parsed.skipDuplicates === true,
      autoAdvance: parsed.autoAdvance === true,
      autoDetectWebtoon: parsed.autoDetectWebtoon === true,
      autoHideControls: parsed.autoHideControls !== false,
      incognito: parsed.incognito === true,
      autoScrollSpeed: clampNumber(
        parsed.autoScrollSpeed,
        1,
        10,
        DEFAULT_READER_SETTINGS.autoScrollSpeed,
      ),
      pagePrevKey: isReaderKey(parsed.pagePrevKey)
        ? parsed.pagePrevKey
        : DEFAULT_READER_SETTINGS.pagePrevKey,
      pageNextKey: isReaderKey(parsed.pageNextKey)
        ? parsed.pageNextKey
        : DEFAULT_READER_SETTINGS.pageNextKey,
      backKey: isReaderKey(parsed.backKey)
        ? parsed.backKey
        : DEFAULT_READER_SETTINGS.backKey,
      deleteAfterReading: parsed.deleteAfterReading === true,
      autoBackground: parsed.autoBackground === true,
      profiles: parseProfiles(parsed.profiles),
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

function parseProfiles(
  value: unknown,
): Partial<Record<ReaderMode, ReaderModeProfile>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const profiles: Partial<Record<ReaderMode, ReaderModeProfile>> = {};

  for (const [key, profile] of Object.entries(value)) {
    if (
      !isReaderMode(key) ||
      typeof profile !== 'object' ||
      profile === null ||
      Array.isArray(profile)
    ) {
      continue;
    }

    const item = profile as Partial<ReaderModeProfile>;

    profiles[key] = {
      widthRem: clampNumber(item.widthRem, 42, 100, DEFAULT_READER_SETTINGS.widthRem),
      gapPx: clampNumber(item.gapPx, 0, 24, DEFAULT_READER_SETTINGS.gapPx),
      background:
        typeof item.background === 'string' &&
        /^#[0-9a-f]{6}$/i.test(item.background)
          ? item.background
          : DEFAULT_READER_SETTINGS.background,
      filter: isReaderFilter(item.filter)
        ? item.filter
        : DEFAULT_READER_SETTINGS.filter,
      scale: isReaderScale(item.scale)
        ? item.scale
        : DEFAULT_READER_SETTINGS.scale,
      direction: item.direction === 'rtl' ? 'rtl' : 'ltr',
    };
  }

  return profiles;
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function isReaderMode(value: unknown): value is ReaderMode {
  return (
    value === 'vertical' ||
    value === 'webtoon' ||
    value === 'single' ||
    value === 'double' ||
    value === 'horizontal'
  );
}

function isReaderFilter(value: unknown): value is ReaderFilter {
  return (
    value === 'original' ||
    value === 'grayscale' ||
    value === 'sepia' ||
    value === 'invert' ||
    value === 'contrast'
  );
}

function isReaderScale(value: unknown): value is ReaderScale {
  return (
    value === 'fit-width' ||
    value === 'fit-height' ||
    value === 'screen' ||
    value === 'original'
  );
}

function persist(next: ReaderSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Preferences remain in memory when storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getReaderSettings(): ReaderSettings {
  return state;
}

export function subscribeReaderSettings(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function updateReaderSettings(patch: Partial<ReaderSettings>): void {
  const nextMode = isReaderMode(patch.mode) ? patch.mode : state.mode;
  const profile = nextMode !== state.mode ? state.profiles[nextMode] : undefined;
  const base = profile ? { ...state, ...profile, mode: nextMode } : state;

  state = {
    ...base,
    ...patch,
    widthRem: clampNumber(
      patch.widthRem ?? base.widthRem,
      42,
      100,
      base.widthRem,
    ),
    gapPx: clampNumber(patch.gapPx ?? base.gapPx, 0, 24, base.gapPx),
    background:
      typeof patch.background === 'string' &&
      /^#[0-9a-f]{6}$/i.test(patch.background)
        ? patch.background
        : base.background,
    mode: nextMode,
    filter: isReaderFilter(patch.filter) ? patch.filter : base.filter,
    brightnessPct: clampNumber(
      patch.brightnessPct ?? base.brightnessPct,
      50,
      150,
      base.brightnessPct,
    ),
    contrastPct: clampNumber(
      patch.contrastPct ?? base.contrastPct,
      50,
      150,
      base.contrastPct,
    ),
    saturationPct: clampNumber(
      patch.saturationPct ?? base.saturationPct,
      0,
      200,
      base.saturationPct,
    ),
    stretchSmallPages:
      typeof patch.stretchSmallPages === 'boolean'
        ? patch.stretchSmallPages
        : base.stretchSmallPages,
    scale: isReaderScale(patch.scale) ? patch.scale : base.scale,
    direction: patch.direction === 'rtl' ? 'rtl' : patch.direction === 'ltr' ? 'ltr' : base.direction,
    keepScreenOn:
      typeof patch.keepScreenOn === 'boolean'
        ? patch.keepScreenOn
        : base.keepScreenOn,
    firstPageOffset: clampNumber(
      patch.firstPageOffset ?? base.firstPageOffset,
      0,
      200,
      base.firstPageOffset,
    ),
    skipDuplicates:
      typeof patch.skipDuplicates === 'boolean'
        ? patch.skipDuplicates
        : base.skipDuplicates,
    autoAdvance:
      typeof patch.autoAdvance === 'boolean'
        ? patch.autoAdvance
        : base.autoAdvance,
    autoDetectWebtoon:
      typeof patch.autoDetectWebtoon === 'boolean'
        ? patch.autoDetectWebtoon
        : base.autoDetectWebtoon,
    autoScrollSpeed: clampNumber(
      patch.autoScrollSpeed ?? base.autoScrollSpeed,
      1,
      10,
      base.autoScrollSpeed,
    ),
    pagePrevKey: isReaderKey(patch.pagePrevKey)
      ? patch.pagePrevKey
      : base.pagePrevKey,
    pageNextKey: isReaderKey(patch.pageNextKey)
      ? patch.pageNextKey
      : base.pageNextKey,
    backKey: isReaderKey(patch.backKey) ? patch.backKey : base.backKey,
    deleteAfterReading:
      typeof patch.deleteAfterReading === 'boolean'
        ? patch.deleteAfterReading
        : base.deleteAfterReading,
    autoBackground:
      typeof patch.autoBackground === 'boolean'
        ? patch.autoBackground
        : base.autoBackground,
    profiles: state.profiles,
  };
  persist(state);
  notify();
}

export function saveReaderModeProfile(): void {
  state = {
    ...state,
    profiles: {
      ...state.profiles,
      [state.mode]: {
        widthRem: state.widthRem,
        gapPx: state.gapPx,
        background: state.background,
        filter: state.filter,
        scale: state.scale,
        direction: state.direction,
      },
    },
  };
  persist(state);
  notify();
}

export function resetReaderSettings(): void {
  state = DEFAULT_READER_SETTINGS;
  persist(state);
  notify();
}
