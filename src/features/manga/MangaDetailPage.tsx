import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createMangaDetailController,
  type MangaDetailController,
} from '../../core/manga/mangaDetailController';
import {
  createMangaRepository,
  type MangaChapter,
} from '../../core/manga/mangaRepository';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import { ActionMenu } from '../../shared/ActionMenu';
import { BackButton } from '../../shared/BackButton';
import {
  getLegacyReturnPath,
  getNavigationOrigin,
  originHref,
  originLabel,
} from '../../app/navigationOrigin';
import { useImageResource } from '../../shared/useImageResource';
import { AmbientArt } from '../../shared/AmbientArt';
import { MangaTrackingSection } from './MangaTrackingSection';
import { MangaNotesSection } from './MangaNotesSection';
import { MangaCategoryPicker } from './MangaCategoryPicker';
import { MangaBookmarkChoices } from './MangaBookmarkChoices';
import { MangaReaderModePicker } from './MangaReaderModePicker';
import {
  getChapterViewPreferences,
  saveChapterViewPreferences,
  type ChapterFilter,
} from '../../core/preferences/chapterViewPreferences';
import { updateAppPreferences } from '../../core/preferences/appPreferences';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { createReaderRepository } from '../../core/reader/readerRepository';
import { createClientDownloadRepository } from '../../core/offline/clientDownloadRepository';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
} from '../../core/offline/offlineStorage';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import {
  IconDownload,
  IconFilter,
  IconSearch,
  IconSort,
} from '../library/icons';

registerMessages('id', {
  Library: 'Perpustakaan',
  "Couldn't load manga": 'Tidak dapat memuat manga',
  'The manga request failed. Try again.':
    'Permintaan manga gagal. Coba lagi.',
  'Continue reading': 'Lanjut membaca',
  'Read first chapter': 'Baca chapter pertama',
  'Read latest chapter': 'Baca chapter terbaru',
  'Read last chapter': 'Baca chapter terakhir',
  'Remove from library': 'Hapus dari perpustakaan',
  'Saving…': 'Menyimpan…',
  'Add to library': 'Tambahkan ke perpustakaan',
  'In library': 'Di perpustakaan',
  'Refreshing…': 'Menyegarkan…',
  Refresh: 'Segarkan',
  'Link copied': 'Tautan disalin',
  'Copy failed': 'Gagal menyalin',
  Share: 'Bagikan',
  Back: 'Kembali',
  'Back to library': 'Kembali ke perpustakaan',
  'Couldn’t update the library state.':
    'Tidak dapat memperbarui status perpustakaan.',
  'Couldn’t refresh manga metadata.':
    'Tidak dapat menyegarkan metadata manga.',
  'Show less': 'Tampilkan lebih sedikit',
  'Show more': 'Tampilkan lebih banyak',
  'No description.': 'Tidak ada deskripsi.',
  Author: 'Penulis',
  Artist: 'Artis',
  Source: 'Sumber',
  Details: 'Detail',
  'Bookmark manga': 'Tandai manga',
  'Remove manga bookmark': 'Hapus tanda manga',
  'Library categories': 'Kategori perpustakaan',
  Overview: 'Ringkasan',
  Synopsis: 'Sinopsis',
  Chapters: 'Chapter',
  Tags: 'Tag',
  More: 'Lainnya',
  'More manga actions': 'Aksi manga lainnya',
  'More actions': 'Aksi lainnya',
  'Sort by': 'Urutkan',
  'Download chapters': 'Unduh chapter',
  'Download server': 'Unduh ke server',
  'Download device': 'Unduh ke perangkat',
  'Select chapters': 'Pilih chapter',
  'Cancel selection': 'Batal pilih',
  'More chapter actions': 'Aksi chapter lainnya',
  'Scan all chapters': 'Pindai semua chapter',
  'Mark earlier': 'Tandai sebelumnya',
  'Mark earlier as read': 'Tandai chapter sebelumnya sebagai dibaca',
  'More chapter actions for': 'Aksi chapter lainnya untuk',
  '{count} chapters': '{count} chapter',
  '1 chapter': '1 chapter',
  '{count} unread': '{count} belum dibaca',
  Order: 'Urutan',
  'Newest first': 'Terbaru dulu',
  'Oldest first': 'Terlama dulu',
  'Chapter order': 'Urutan chapter',
  Select: 'Pilih',
  Done: 'Selesai',
  'Scan all': 'Pindai semua',
  'Scanning…': 'Memindai…',
  'Search chapters': 'Cari chapter',
  'All chapters': 'Semua chapter',
  Unread: 'Belum dibaca',
  Read: 'Sudah dibaca',
  Downloaded: 'Terunduh',
  Bookmarked: 'Ditandai',
  'Hide duplicates': 'Sembunyikan duplikat',
  'All scanlators': 'Semua scanlator',
  '{count} selected': '{count} dipilih',
  'Mark read': 'Tandai dibaca',
  'Mark unread': 'Tandai belum dibaca',
  Bookmark: 'Tandai',
  'Remove bookmark': 'Hapus tanda',
  Download: 'Unduh',
  'Confirm delete': 'Konfirmasi hapus',
  'Delete download': 'Hapus unduhan',
  Cancel: 'Batal',
  Clear: 'Bersihkan',
  'No chapters available.': 'Tidak ada chapter.',
  'No chapters match these filters.':
    'Tidak ada chapter yang cocok dengan filter ini.',
  'Download target': 'Target unduhan',
  Server: 'Server',
  'This device': 'Perangkat ini',
  'Saving to device…': 'Menyimpan ke perangkat…',
  'Device download failed.': 'Unduhan perangkat gagal.',
});

const STATUS_LABEL: Record<string, string> = {
  UNKNOWN: 'Unknown',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  LICENSED: 'Licensed',
  PUBLISHING_FINISHED: 'Publishing finished',
  CANCELLED: 'Cancelled',
  ON_HIATUS: 'On hiatus',
};

function MangaBookmarkIcon({ filled }: { readonly filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path
        d="M5.2 3.6h9.6v13.2L10 13.6l-4.8 3.2V3.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MangaDotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="4.5" cy="10" r="1.35" />
      <circle cx="10" cy="10" r="1.35" />
      <circle cx="15.5" cy="10" r="1.35" />
    </svg>
  );
}

function MangaReadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 5.2C8.4 4.1 6.3 3.6 3.8 3.6v10.7c2.5 0 4.6.5 6.2 1.6 1.6-1.1 3.7-1.6 6.2-1.6V3.6c-2.5 0-4.6.5-6.2 1.6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 5.2v10.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function formatDate(value: string): string | null {
  const date = new Date(Number(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

function chapterMeta(chapter: {
  readonly lastPageRead: number;
  readonly pageCount: number;
  readonly isRead: boolean;
}): string {
  if (!chapter.isRead && chapter.lastPageRead > 0) {
    return `Page ${chapter.lastPageRead} of ${chapter.pageCount}`;
  }

  return chapter.pageCount === 1 ? '1 page' : `${chapter.pageCount} pages`;
}

type ChapterEntry<T extends { readonly chapterNumber: number }> =
  | { readonly kind: 'chapter'; readonly chapter: T }
  | {
      readonly kind: 'gap';
      readonly missing: number;
      readonly from: number;
      readonly to: number;
    };

function chapterEntries<T extends { readonly chapterNumber: number }>(
  chapters: readonly T[],
): readonly ChapterEntry<T>[] {
  const entries: ChapterEntry<T>[] = [];

  chapters.forEach((chapter, index) => {
    if (index > 0) {
      const previous = chapters[index - 1];
      const gap = Math.abs(previous.chapterNumber - chapter.chapterNumber);
      const missing = Number.isFinite(gap) ? Math.max(0, Math.ceil(gap) - 1) : 0;

      if (missing > 0) {
        entries.push({
          kind: 'gap',
          missing,
          from: Math.min(previous.chapterNumber, chapter.chapterNumber),
          to: Math.max(previous.chapterNumber, chapter.chapterNumber),
        });
      }
    }

    entries.push({ kind: 'chapter', chapter });
  });

  return entries;
}

export function MangaDetailPage() {
  const { state } = useConnection();
  const { from } = useAppPath();
  const { mangaId } = useParams();
  const id = Number(mangaId);

  if (state.status !== 'connected') {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from,
        }}
      />
    );
  }

  if (!mangaId || !Number.isSafeInteger(id) || id <= 0) {
    return <Navigate to="/library" replace />;
  }

  return <ConnectedMangaDetail context={state.context} mangaId={id} />;
}

function ConnectedMangaDetail({
  context,
  mangaId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
}) {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const origin = getNavigationOrigin(location.state);
  const canGoBack = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0;
  const legacyReturn = getLegacyReturnPath(location.state);
  const returnTo = origin ? originHref(origin) : (legacyReturn ?? '/library');
  const returnLabel = origin
    ? origin.section === 'library'
      ? t('Back to library')
      : t('Back')
    : returnTo === '/library'
      ? t('Back to library')
      : t('Back');
  const repository = useMemo(
    () => createMangaRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const savedView = useRef(getChapterViewPreferences(mangaId)).current;
  const controller = useMemo(
    () =>
      createMangaDetailController({
        repository,
        mangaId,
        initialOrder: savedView?.order,
      }),
    [mangaId, repository, savedView],
  );
  const detail = useSyncExternalStore(controller.subscribe, controller.getState);
  const appPreferences = useAppPreferences();
  const readerRepository = useMemo(
    () => createReaderRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const offlineStorage = useMemo(() => createOfflineStorage(), []);
  const clientDownloads = useMemo(
    () =>
      createClientDownloadRepository({
        reader: readerRepository,
        resources: context.resources,
        storage: offlineStorage,
        serverBaseUrl: context.config.serverBaseUrl,
      }),
    [context.config.serverBaseUrl, context.resources, offlineStorage, readerRepository],
  );
  const [deviceRecords, setDeviceRecords] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [deviceProgress, setDeviceProgress] = useState<{
    readonly completed: number;
    readonly total: number;
  } | null>(null);
  const [deviceError, setDeviceError] = useState(false);
  const loaded = useRef<MangaDetailController | null>(null);
  const [scannedChapters, setScannedChapters] = useState<
    readonly MangaChapter[] | null
  >(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [section, setSection] = useState<'overview' | 'chapters'>(
    searchParams.get('section') === 'overview' ? 'overview' : 'chapters',
  );
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const [chapterSearchOpen, setChapterSearchOpen] = useState(false);
  const [chapterFilter, setChapterFilter] = useState<ChapterFilter>(
    savedView?.filter ?? 'all',
  );
  const [scanlator, setScanlator] = useState(savedView?.scanlator ?? 'all');
  const [hideDuplicates, setHideDuplicates] = useState(
    savedView?.hideDuplicates ?? false,
  );
  const [chapterSelectionMode, setChapterSelectionMode] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [lastSelectedChapterIndex, setLastSelectedChapterIndex] = useState<
    number | null
  >(null);
  const [chapterBulkBusy, setChapterBulkBusy] = useState(false);
  const [chapterActionError, setChapterActionError] = useState(false);
  const [pendingChapterId, setPendingChapterId] = useState<number | null>(null);
  const chapterLongPressTimer = useRef<number | null>(null);
  const chapterLongPressTriggered = useRef(false);
  const [queuedChapters, setQueuedChapters] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [libraryPending, setLibraryPending] = useState(false);
  const [libraryActionError, setLibraryActionError] = useState(false);
  const [refreshPending, setRefreshPending] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [coverPortrait, setCoverPortrait] = useState(false);
  const cover = useImageResource(
    context.resources,
    detail.manga?.thumbnailUrl ?? null,
  );

  useEffect(() => {
    if (loaded.current !== controller) {
      loaded.current = controller;
      void controller.load();
    }
  }, [controller]);

  useEffect(() => {
    saveChapterViewPreferences(mangaId, {
      order: detail.order,
      filter: chapterFilter,
      scanlator,
      hideDuplicates,
    });
  }, [chapterFilter, detail.order, hideDuplicates, mangaId, scanlator]);

  useEffect(() => {
    setSection(searchParams.get('section') === 'overview' ? 'overview' : 'chapters');
  }, [searchParams]);

  useEffect(() => {
    setScannedChapters(null);
    setScanError(false);
  }, [mangaId]);

  const changeSection = (next: 'overview' | 'chapters') => {
    setSection(next);
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);

        if (next === 'chapters') {
          params.delete('section');
        } else {
          params.set('section', next);
        }

        return params;
      },
      { replace: false },
    );
  };

  useEffect(() => {
    if (!isOfflineStorageSupported()) {
      return;
    }

    void clientDownloads
      .list()
      .then((records) =>
        setDeviceRecords(new Set(records.map((record) => record.chapterId))),
      )
      .catch(() => setDeviceError(true));
  }, [clientDownloads, mangaId]);

  const downloadToDevice = async (chapterIds: readonly number[]) => {
    if (deviceProgress) {
      return;
    }

    setDeviceError(false);
    const pending = chapterIds.filter((id) => !deviceRecords.has(id));

    for (let index = 0; index < pending.length; index += 1) {
      const chapterId = pending[index];
      setPendingChapterId(chapterId);

      try {
        await clientDownloads.downloadChapter(chapterId, (progress) =>
          setDeviceProgress({
            completed: progress.completedPages,
            total: progress.totalPages,
          }),
        );
        setDeviceRecords((current) => {
          const next = new Set(current);
          next.add(chapterId);
          return next;
        });
      } catch {
        setDeviceError(true);
        break;
      } finally {
        setDeviceProgress(null);
        setPendingChapterId(null);
      }
    }
  };

  if (!detail.manga && !detail.error) {
    return (
      <div className="app-shell detail-shell">
        <div className="detail-loading" role="status">
          Loading manga…
        </div>
      </div>
    );
  }

  if (detail.error || !detail.manga) {
    return (
      <div className="app-shell detail-shell">
        <div className="library-state" role="alert">
          <h1>{t("Couldn't load manga")}</h1>
          <p>{t('The manga request failed. Try again.')}</p>
          <div className="actions">
            <button className="button" type="button" onClick={() => void controller.load()}>
              Retry
            </button>
            <BackButton
              to={returnTo}
              label={returnLabel}
              onClick={(event) => {
                if (origin && canGoBack) {
                  event.preventDefault();
                  navigate(-1);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const manga = detail.manga;
  const firstChapter = detail.chapters[0] ?? null;
  const inProgressChapter =
    detail.chapters.find(
      (chapter) => !chapter.isRead && chapter.lastPageRead > 0,
    ) ?? null;
  const primaryChapter = inProgressChapter ?? firstChapter;
  const unreadCount = detail.chapters.filter((chapter) => !chapter.isRead).length;
  const authorLine = [
    manga.author ? `${t('Author')}: ${manga.author}` : null,
    manga.artist ? `${t('Artist')}: ${manga.artist}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const ensureLibrary = async () => {
    setLibraryActionError(false);
    setLibraryPending(true);

    try {
      await controller.setInLibrary(true);
    } catch (error) {
      setLibraryActionError(true);
      throw error;
    } finally {
      setLibraryPending(false);
    }
  };
  const mangaMenu = (
    <>
      <button
        type="button"
        disabled={refreshPending}
        onClick={() => {
          setRefreshError(false);
          setRefreshPending(true);
          void controller
            .refresh()
            .catch(() => setRefreshError(true))
            .finally(() => setRefreshPending(false));
        }}
      >
        {refreshPending ? t('Refreshing…') : t('Refresh')}
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.location.href;

          if (typeof navigator.share === 'function') {
            void navigator
              .share({ title: manga.title, text: manga.title, url })
              .catch(() => undefined);
            return;
          }

          void navigator.clipboard
            ?.writeText(url)
            .then(() => setShareState('copied'))
            .catch(() => setShareState('error'));
        }}
      >
        {shareState === 'copied'
          ? t('Link copied')
          : shareState === 'error'
            ? t('Copy failed')
            : t('Share')}
      </button>
    </>
  );
  const scanlators = [
    ...new Set(
      (scannedChapters ?? detail.chapters)
        .map((chapter) => chapter.scanlator)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right));
  const scanAllChapters = async () => {
    setScanBusy(true);
    setScanError(false);
    const collected: MangaChapter[] = [];
    let after: string | null = null;

    try {
      for (;;) {
        const page = await repository.getDetail({
          mangaId,
          first: 200,
          after,
          order: detail.order,
        });
        collected.push(...page.chapters);

        if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) {
          break;
        }

        after = page.pageInfo.endCursor;
      }

      setScannedChapters(collected);
    } catch {
      setScanError(true);
    } finally {
      setScanBusy(false);
    }
  };
  const filteredChapters = (scannedChapters ?? detail.chapters).filter((chapter) => {
    if (scanlator !== 'all' && chapter.scanlator !== scanlator) {
      return false;
    }

    if (chapterFilter === 'unread' && chapter.isRead) {
      return false;
    }

    if (chapterFilter === 'read' && !chapter.isRead) {
      return false;
    }

    if (chapterFilter === 'downloaded' && !chapter.isDownloaded) {
      return false;
    }

    if (chapterFilter === 'bookmarked' && !chapter.isBookmarked) {
      return false;
    }

    const query = chapterSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return `${chapter.name} ${chapter.scanlator ?? ''}`
      .toLowerCase()
      .includes(query);
  });
  const visibleChapters = hideDuplicates
    ? filteredChapters.filter(
        (chapter, index, items) =>
          items.findIndex(
            (item) => item.chapterNumber === chapter.chapterNumber,
          ) === index,
      )
    : filteredChapters;

  const toggleChapterRange = (
    chapterId: number,
    index: number,
    shiftKey: boolean,
  ) => {
    setSelectedChapterIds((current) => {
      const next = new Set(current);

      if (shiftKey && lastSelectedChapterIndex !== null) {
        const start = Math.min(lastSelectedChapterIndex, index);
        const end = Math.max(lastSelectedChapterIndex, index);

        for (let position = start; position <= end; position += 1) {
          const chapter = visibleChapters[position];

          if (chapter) {
            next.add(chapter.id);
          }
        }
      } else if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }

      return next;
    });
    setLastSelectedChapterIndex(index);
  };

  const clearChapterLongPress = () => {
    if (chapterLongPressTimer.current !== null) {
      window.clearTimeout(chapterLongPressTimer.current);
      chapterLongPressTimer.current = null;
    }
  };

  const startChapterLongPress = (chapterId: number, index: number) => {
    if (chapterSelectionMode) {
      return;
    }

    clearChapterLongPress();
    chapterLongPressTriggered.current = false;
    chapterLongPressTimer.current = window.setTimeout(() => {
      chapterLongPressTriggered.current = true;
      setChapterSelectionMode(true);
      setSelectedChapterIds(new Set([chapterId]));
      setLastSelectedChapterIndex(index);
    }, 500);
  };

  const runChapterBulkAction = async (
    action: (ids: readonly number[]) => Promise<void>,
  ) => {
    if (selectedChapterIds.size === 0) {
      return;
    }

    setChapterBulkBusy(true);
    setChapterActionError(false);

    try {
      await action([...selectedChapterIds]);
      setSelectedChapterIds(new Set());
      setChapterSelectionMode(false);
      setLastSelectedChapterIndex(null);
    } catch {
      setChapterActionError(true);
    } finally {
      setChapterBulkBusy(false);
    }
  };


  const selectedChapters = (scannedChapters ?? detail.chapters).filter((chapter) =>
    selectedChapterIds.has(chapter.id),
  );
  const allSelectedRead =
    selectedChapters.length > 0 && selectedChapters.every((chapter) => chapter.isRead);
  const allSelectedUnread =
    selectedChapters.length > 0 && selectedChapters.every((chapter) => !chapter.isRead);
  const allSelectedBookmarked =
    selectedChapters.length > 0 &&
    selectedChapters.every((chapter) => chapter.isBookmarked);
  const allSelectedUnbookmarked =
    selectedChapters.length > 0 &&
    selectedChapters.every((chapter) => !chapter.isBookmarked);

  const downloadSelection = (target: 'server' | 'device') => {
    const ids = [...selectedChapterIds];

    if (ids.length === 0) {
      setChapterSelectionMode(true);
      return;
    }

    updateAppPreferences({ downloadTarget: target });

    if (target === 'device') {
      void downloadToDevice(ids).then(() => {
        setSelectedChapterIds(new Set());
        setChapterSelectionMode(false);
        setLastSelectedChapterIndex(null);
      });
      return;
    }

    void runChapterBulkAction(async (selected) => {
      setQueuedChapters((current) => {
        const next = new Set(current);
        selected.forEach((id) => next.add(id));
        return next;
      });
      await controller.enqueueChapterDownloads(selected);
    });
  };

  return (
    <div className="app-shell detail-shell">
      <AmbientArt imageUrl={cover.objectUrl} className="detail-ambient" />
      <nav className="page-nav" aria-label="Breadcrumb">
        <BackButton
          className="detail-nav-back"
          label={returnLabel}
          to={returnTo}
          onClick={(event) => {
            if (canGoBack && origin) {
              event.preventDefault();
              navigate(-1);
            }
          }}
        />
        <div className="page-nav-trail">
          {origin?.trail.map((crumb, index) => (
            <Fragment key={`${crumb.pathname}-${index}`}>
              <Link to={originHref(crumb)}>{originLabel(crumb, t)}</Link>
              <span aria-hidden="true">/</span>
            </Fragment>
          ))}
          <span className="page-nav-current">{manga.title}</span>
        </div>
        <div className="manga-hero-controls">
          <ActionMenu
            label={<MangaBookmarkIcon filled={manga.inLibrary} />}
            ariaLabel={
              manga.inLibrary ? t('Library categories') : t('Add to library')
            }
            className={libraryPending ? 'is-busy' : ''}
            summaryClassName={`hero-control${manga.inLibrary ? ' is-active' : ''}`}
          >
            <MangaBookmarkChoices
              context={context}
              mangaId={manga.id}
              onEnsureLibrary={ensureLibrary}
            />
          </ActionMenu>
          <ActionMenu
            label={<MangaDotsIcon />}
            ariaLabel={t('More manga actions')}
            summaryClassName="hero-control hero-more"
          >
            {mangaMenu}
          </ActionMenu>
        </div>
      </nav>

      <main className="manga-detail">
        <div className="manga-top">
          <header
            className={`manga-hero${coverPortrait ? ' is-portrait-cover' : ''}`}
            id="overview"
          >
            <div className="manga-hero-cover">
              {cover.objectUrl ? (
                <img
                  src={cover.objectUrl}
                  alt=""
                  decoding="async"
                  onLoad={(event) =>
                    setCoverPortrait(
                      event.currentTarget.naturalHeight >
                        event.currentTarget.naturalWidth * 1.1,
                    )
                  }
                />
              ) : (
                <span className="manga-hero-placeholder" aria-hidden="true">
                  {manga.title.trim().charAt(0).toUpperCase() || '·'}
                </span>
              )}
            </div>
          </header>

          <section
            className="manga-info-panel"
            aria-labelledby="manga-title"
          >
            <div className="manga-meta-row">
              <span className="manga-status">
                {STATUS_LABEL[manga.status] ?? manga.status}
              </span>
              <span>
                {detail.totalCount === 1
                  ? t('1 chapter')
                  : t('{count} chapters', { count: detail.totalCount })}
              </span>
              {unreadCount > 0 ? (
                <span>
                  {t('{count} unread', { count: unreadCount })}
                </span>
              ) : null}
              {manga.source ? <span>{manga.source.name}</span> : null}
            </div>

            <h1 id="manga-title">{manga.title}</h1>
            {authorLine ? <p className="manga-byline">{authorLine}</p> : null}

            {manga.description ? (
              <>
                <p className="manga-synopsis-preview">
                  {manga.description}
                </p>
                <button
                  className="description-toggle manga-panel-more"
                  type="button"
                  onClick={() => {
                    changeSection('overview');
                    setDescriptionExpanded(true);
                    window.setTimeout(() => {
                      document
                        .getElementById('manga-sections')
                        ?.scrollIntoView({ block: 'start' });
                    }, 180);
                  }}
                >
                  {t('Show more')}
                </button>
              </>
            ) : (
              <p className="manga-synopsis-preview manga-description-empty">
                {t('No description.')}
              </p>
            )}

            <div className="manga-actions">
              {primaryChapter ? (
                <Link
                  className="button detail-primary"
                  to={`/manga/${manga.id}/chapter/${primaryChapter.id}${
                    inProgressChapter && inProgressChapter.lastPageRead > 0
                      ? `?page=${inProgressChapter.lastPageRead + 1}`
                      : ''
                  }`}
                  state={{ ...(origin ? { origin } : {}), fromManga: true }}
                >
                  <MangaReadIcon />
                  {inProgressChapter
                    ? t('Continue reading')
                    : detail.order === 'oldest'
                      ? t('Read first chapter')
                      : t('Read last chapter')}
                </Link>
              ) : null}
            </div>

            {libraryActionError ? (
              <p className="alert alert-error" role="alert">
                {t('Couldn’t update the library state.')}
              </p>
            ) : null}

            {refreshError ? (
              <p className="alert alert-error" role="alert">
                {t('Couldn’t refresh manga metadata.')}
              </p>
            ) : null}
          </section>
        </div>

        <div className="manga-sections" id="manga-sections">
          <nav className="detail-tabs" aria-label="Manga sections">
            <button
              className={section === 'chapters' ? 'is-active' : undefined}
              type="button"
              aria-current={section === 'chapters' ? 'true' : undefined}
              onClick={() => changeSection('chapters')}
            >
              {t('Chapters')}
            </button>
            <button
              className={section === 'overview' ? 'is-active' : undefined}
              type="button"
              aria-current={section === 'overview' ? 'true' : undefined}
              onClick={() => changeSection('overview')}
            >
              {t('Overview')}
            </button>
          </nav>

        {section === 'overview' ? (
          <>
            <section
              className="manga-overview-facts"
              aria-labelledby="manga-facts-heading"
            >
              <h2 id="manga-facts-heading">{t('Details')}</h2>
              <dl>
                <div>
                  <dt>{t('Status')}</dt>
                  <dd>{STATUS_LABEL[manga.status] ?? manga.status}</dd>
                </div>
                {manga.author ? (
                  <div>
                    <dt>{t('Author')}</dt>
                    <dd>{manga.author}</dd>
                  </div>
                ) : null}
                {manga.artist ? (
                  <div>
                    <dt>{t('Artist')}</dt>
                    <dd>{manga.artist}</dd>
                  </div>
                ) : null}
                {manga.source ? (
                  <div>
                    <dt>{t('Source')}</dt>
                    <dd>{manga.source.name}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{t('Chapters')}</dt>
                  <dd>
                    {detail.totalCount === 1
                      ? t('1 chapter')
                      : t('{count} chapters', { count: detail.totalCount })}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              className="manga-overview-synopsis"
              aria-labelledby="manga-synopsis-heading"
            >
              <h2 id="manga-synopsis-heading">{t('Synopsis')}</h2>
              {manga.description ? (
                <>
                  <p
                    className={`manga-description${
                      !descriptionExpanded && manga.description.length > 240
                        ? ' is-clamped'
                        : ''
                    }`}
                  >
                    {manga.description}
                  </p>
                  {manga.description.length > 240 ? (
                    <button
                      className="description-toggle"
                      type="button"
                      aria-expanded={descriptionExpanded}
                      onClick={() => setDescriptionExpanded((value) => !value)}
                    >
                      {descriptionExpanded ? t('Show less') : t('Show more')}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="manga-description manga-description-empty">
                  {t('No description.')}
                </p>
              )}
            </section>

            {manga.genre.length > 0 ? (
              <section className="manga-overview-tags" aria-labelledby="manga-tags-heading">
                <h2 id="manga-tags-heading">{t('Tags')}</h2>
                <ul className="manga-genres" aria-label="Genres">
                  {manga.genre.map((genre) => (
                    <li key={genre}>{genre}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <MangaTrackingSection
              context={context}
              mangaId={manga.id}
              mangaTitle={manga.title}
            />

            <MangaNotesSection context={context} mangaId={manga.id} />
            <MangaCategoryPicker context={context} mangaId={manga.id} />
            <MangaReaderModePicker mangaId={manga.id} />
          </>
        ) : null}

        {section === 'chapters' ? (
        <section className="chapter-section" id="chapters" aria-labelledby="chapters-heading">
          <div className="chapter-section-header">
            <div>
              <h2 id="chapters-heading">{t('Chapters')}</h2>
              <p className="chapter-section-count">
                {detail.totalCount === 1
                  ? t('1 chapter')
                  : t('{count} chapters', { count: detail.totalCount })}
              </p>
            </div>
            <div className="chapter-header-actions">
              <button
                className={`chapter-header-action${chapterSearchOpen || chapterSearch ? ' is-active' : ''}`}
                type="button"
                aria-label={t('Search chapters')}
                aria-expanded={chapterSearchOpen}
                title={t('Search chapters')}
                onClick={() => setChapterSearchOpen((value) => !value)}
              >
                <IconSearch />
              </button>
              <ActionMenu
                label={<IconSort />}
                ariaLabel={t('Sort by')}
                summaryClassName="chapter-header-action"
              >
                <button
                  type="button"
                  className={detail.order === 'newest' ? 'is-active' : undefined}
                  aria-pressed={detail.order === 'newest'}
                  onClick={() => void controller.setOrder('newest')}
                >
                  {t('Newest first')}
                </button>
                <button
                  type="button"
                  className={detail.order === 'oldest' ? 'is-active' : undefined}
                  aria-pressed={detail.order === 'oldest'}
                  onClick={() => void controller.setOrder('oldest')}
                >
                  {t('Oldest first')}
                </button>
              </ActionMenu>
              <ActionMenu
                label={<IconFilter />}
                ariaLabel={t('More chapter actions')}
                summaryClassName="chapter-header-action"
              >
                <p className="action-menu-section">Filters</p>
                {(
                  [
                    ['all', t('All chapters')],
                    ['unread', t('Unread')],
                    ['read', t('Read')],
                    ['downloaded', t('Downloaded')],
                    ['bookmarked', t('Bookmarked')],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={chapterFilter === value ? 'is-active' : undefined}
                    aria-pressed={chapterFilter === value}
                    onClick={() => setChapterFilter(value)}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  className={hideDuplicates ? 'is-active' : undefined}
                  aria-pressed={hideDuplicates}
                  onClick={() => setHideDuplicates((value) => !value)}
                >
                  {t('Hide duplicates')}
                </button>
                <button
                  type="button"
                  disabled={scanBusy}
                  onClick={() => void scanAllChapters()}
                >
                  {scanBusy
                    ? t('Scanning…')
                    : scannedChapters
                      ? scannedChapters.length === 1
                        ? t('1 chapter')
                        : t('{count} chapters', { count: scannedChapters.length })
                      : t('Scan all chapters')}
                </button>
                {scanlators.length > 0 ? (
                  <label className="chapter-select">
                    <span className="sr-only">Filter by scanlator</span>
                    <select
                      aria-label="Filter by scanlator"
                      value={scanlator}
                      onChange={(event) => setScanlator(event.target.value)}
                    >
                      <option value="all">{t('All scanlators')}</option>
                      {scanlators.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </ActionMenu>
              <ActionMenu
                label={<IconDownload />}
                ariaLabel={t('Download chapters')}
                summaryClassName="chapter-header-action"
              >
                <button
                  type="button"
                  disabled={chapterBulkBusy || selectedChapterIds.size === 0}
                  onClick={() => downloadSelection('server')}
                >
                  {t('Download server')}
                </button>
                <button
                  type="button"
                  disabled={
                    chapterBulkBusy ||
                    selectedChapterIds.size === 0 ||
                    !isOfflineStorageSupported()
                  }
                  onClick={() => downloadSelection('device')}
                >
                  {t('Download device')}
                </button>
                {selectedChapterIds.size === 0 ? (
                  <button
                    type="button"
                    onClick={() => setChapterSelectionMode(true)}
                  >
                    {t('Select chapters')}
                  </button>
                ) : null}
              </ActionMenu>
            </div>
          </div>

          {chapterSearchOpen || chapterSearch ? (
            <label className="chapter-search chapter-search-panel">
              <span className="sr-only">Search chapters</span>
              <input
                autoFocus
                type="search"
                placeholder="Search chapters…"
                value={chapterSearch}
                onChange={(event) => setChapterSearch(event.target.value)}
              />
            </label>
          ) : null}

          {deviceProgress ? (
            <p className="settings-save-state" role="status">
              {t('Saving to device…')} {deviceProgress.completed}/
              {deviceProgress.total}
            </p>
          ) : null}
          {deviceError ? (
            <p className="settings-inline-error" role="alert">
              {t('Device download failed.')}
            </p>
          ) : null}

          {chapterSelectionMode ? (
            <div className="chapter-bulk-rail" role="toolbar" aria-label="Bulk chapter actions">
              <strong>{t('{count} selected', { count: selectedChapterIds.size })}</strong>
              <div className="chapter-bulk-rail-actions">
                {!allSelectedRead ? (
                  <button
                    className="library-action"
                    type="button"
                    disabled={chapterBulkBusy || selectedChapterIds.size === 0}
                    onClick={() =>
                      void runChapterBulkAction((ids) =>
                        controller.setChaptersRead(ids, true),
                      )
                    }
                  >
                    {t('Mark read')}
                  </button>
                ) : null}
                {!allSelectedUnread ? (
                  <button
                    className="library-action"
                    type="button"
                    disabled={chapterBulkBusy || selectedChapterIds.size === 0}
                    onClick={() =>
                      void runChapterBulkAction((ids) =>
                        controller.setChaptersRead(ids, false),
                      )
                    }
                  >
                    {t('Mark unread')}
                  </button>
                ) : null}
                {!allSelectedBookmarked ? (
                  <button
                    className="library-action"
                    type="button"
                    disabled={chapterBulkBusy || selectedChapterIds.size === 0}
                    onClick={() =>
                      void runChapterBulkAction((ids) =>
                        controller.setChaptersBookmark(ids, true),
                      )
                    }
                  >
                    {t('Bookmark')}
                  </button>
                ) : null}
                {!allSelectedUnbookmarked ? (
                  <button
                    className="library-action"
                    type="button"
                    disabled={chapterBulkBusy || selectedChapterIds.size === 0}
                    onClick={() =>
                      void runChapterBulkAction((ids) =>
                        controller.setChaptersBookmark(ids, false),
                      )
                    }
                  >
                    {t('Remove bookmark')}
                  </button>
                ) : null}
              </div>
              <button
                className="chapter-bulk-cancel"
                type="button"
                aria-label={t('Cancel selection')}
                title={t('Cancel selection')}
                onClick={() => {
                  setSelectedChapterIds(new Set());
                  setLastSelectedChapterIndex(null);
                  setChapterSelectionMode(false);
                }}
              >
                ×
              </button>
            </div>
          ) : null}

          {detail.chapters.length === 0 ? (
            <p className="chapter-empty">{t('No chapters available.')}</p>
          ) : visibleChapters.length === 0 ? (
            <p className="chapter-empty">{t('No chapters match these filters.')}</p>
          ) : (
            <ol className="chapter-list">
              {chapterEntries(visibleChapters).map((entry) => {
                if (entry.kind === 'gap') {
                  return (
                    <li
                      className="chapter-gap"
                      key={`gap-${entry.from}-${entry.to}`}
                    >
                      {entry.missing} missing{' '}
                      {entry.missing === 1 ? 'chapter' : 'chapters'} between{' '}
                      {entry.from} and {entry.to}
                    </li>
                  );
                }

                const chapter = entry.chapter;
                const index = visibleChapters.indexOf(chapter);
                const uploaded = formatDate(chapter.uploadDate);
                const deviceMode = appPreferences.downloadTarget === 'device';
                const downloaded = deviceMode
                  ? deviceRecords.has(chapter.id)
                  : chapter.isDownloaded;
                const queued = deviceMode
                  ? pendingChapterId === chapter.id
                  : queuedChapters.has(chapter.id);

                return (
                  <li className="chapter-item" key={chapter.id}>
                    {chapterSelectionMode ? (
                      <button
                        className={`chapter-select-check${
                          selectedChapterIds.has(chapter.id) ? ' is-selected' : ''
                        }`}
                        type="button"
                        aria-pressed={selectedChapterIds.has(chapter.id)}
                        aria-label={`Select ${chapter.name}`}
                        onClick={(event) =>
                          toggleChapterRange(
                            chapter.id,
                            index,
                            event.shiftKey,
                          )
                        }
                      >
                        {selectedChapterIds.has(chapter.id) ? '✓' : ''}
                      </button>
                    ) : null}
                    <Link
                      className="chapter-row"
                      to={`/manga/${manga.id}/chapter/${chapter.id}`}
                    state={{ ...(origin ? { origin } : {}), fromManga: true }}
                      onPointerDown={() =>
                        startChapterLongPress(chapter.id, index)
                      }
                      onPointerUp={clearChapterLongPress}
                      onPointerCancel={clearChapterLongPress}
                      onPointerLeave={clearChapterLongPress}
                      onClick={(event) => {
                        clearChapterLongPress();

                        if (chapterLongPressTriggered.current) {
                          event.preventDefault();
                          chapterLongPressTriggered.current = false;
                        }
                      }}
                    >
                      <span className="chapter-play" aria-hidden="true">
                        ▶
                      </span>
                      <span className="chapter-row-main">
                        <span className="chapter-name">{chapter.name}</span>
                        <span className="chapter-meta">
                          {[
                            uploaded,
                            chapterMeta(chapter),
                            chapter.scanlator,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </Link>
                    <div className="chapter-actions">
                      {!downloaded ? (
                        <button
                          className={`chapter-icon-button${queued ? ' is-queued' : ''}`}
                          type="button"
                          disabled={pendingChapterId === chapter.id}
                          aria-label={`${
                            queued ? 'Cancel download for' : 'Download'
                          } ${chapter.name}`}
                          aria-pressed={queued}
                          onClick={() => {
                            setChapterActionError(false);

                            if (deviceMode) {
                              void downloadToDevice([chapter.id]);
                              return;
                            }

                            if (queued) {
                              setPendingChapterId(chapter.id);
                              setQueuedChapters((current) => {
                                const next = new Set(current);
                                next.delete(chapter.id);
                                return next;
                              });
                              void controller
                                .dequeueChapterDownload(chapter.id)
                                .catch(() => setChapterActionError(true))
                                .finally(() => setPendingChapterId(null));
                              return;
                            }

                            setPendingChapterId(chapter.id);
                            setQueuedChapters((current) => {
                              const next = new Set(current);
                              next.add(chapter.id);
                              return next;
                            });
                            void controller
                              .enqueueChapterDownloads([chapter.id])
                              .catch(() => {
                                setQueuedChapters((current) => {
                                  const next = new Set(current);
                                  next.delete(chapter.id);
                                  return next;
                                });
                                setChapterActionError(true);
                              })
                              .finally(() => setPendingChapterId(null));
                          }}
                        >
                          {queued ? '×' : '↓'}
                        </button>
                      ) : null}
                      <button
                        className={`chapter-read-toggle${
                          chapter.isRead ? ' is-read' : ''
                        }`}
                        type="button"
                        disabled={pendingChapterId === chapter.id}
                        aria-label={`Mark ${chapter.name} as ${
                          chapter.isRead ? 'unread' : 'read'
                        }`}
                        aria-pressed={chapter.isRead}
                        title={
                          chapter.isRead
                            ? `Mark ${chapter.name} as unread`
                            : `Mark ${chapter.name} as read`
                        }
                        onClick={() => {
                          setChapterActionError(false);
                          setPendingChapterId(chapter.id);
                          void controller
                            .setChapterRead(chapter.id, !chapter.isRead)
                            .catch(() => setChapterActionError(true))
                            .finally(() => setPendingChapterId(null));
                        }}
                      >
                        {chapter.isRead ? t('Read') : t('Unread')}
                      </button>
                      <ActionMenu
                        label="⋯"
                        ariaLabel={`${t('More chapter actions for')} ${chapter.name}`}
                        summaryClassName="chapter-icon-button chapter-row-more"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setChapterSelectionMode(true);
                            setSelectedChapterIds(new Set([chapter.id]));
                            setLastSelectedChapterIndex(index);
                          }}
                        >
                          {t('Select')}
                        </button>
                        <button
                          type="button"
                          disabled={pendingChapterId === chapter.id}
                          onClick={() => {
                            setChapterActionError(false);
                            setPendingChapterId(chapter.id);
                            void controller
                              .setChapterBookmark(
                                chapter.id,
                                !chapter.isBookmarked,
                              )
                              .catch(() => setChapterActionError(true))
                              .finally(() => setPendingChapterId(null));
                          }}
                        >
                          {chapter.isBookmarked
                            ? t('Remove bookmark')
                            : t('Bookmark')}
                        </button>
                        <button
                          type="button"
                          disabled={
                            pendingChapterId === chapter.id ||
                            !detail.chapters.some(
                              (item) =>
                                item.sourceOrder < chapter.sourceOrder &&
                                !item.isRead,
                            )
                          }
                          title={`Mark chapters before ${chapter.name} as read`}
                          onClick={() => {
                            const ids = detail.chapters
                              .filter(
                                (item) =>
                                  item.sourceOrder < chapter.sourceOrder &&
                                  !item.isRead,
                              )
                              .map((item) => item.id);

                            setChapterActionError(false);
                            setPendingChapterId(chapter.id);
                            void controller
                              .setChaptersRead(ids, true)
                              .catch(() => setChapterActionError(true))
                              .finally(() => setPendingChapterId(null));
                          }}
                        >
                          {t('Mark earlier as read')}
                        </button>
                      </ActionMenu>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {scanError ? (
            <p className="alert alert-error" role="alert">
              Could not scan the full chapter list.
            </p>
          ) : null}

          {chapterActionError ? (
            <p className="alert alert-error" role="alert">
              Couldn&apos;t update the chapter state.
            </p>
          ) : null}

          {detail.loadMoreError ? (
            <p className="alert alert-error" role="alert">
              Couldn&apos;t load more chapters.
            </p>
          ) : null}

          {!scannedChapters && detail.pageInfo.hasNextPage ? (
            <div className="chapter-load-more">
              <button
                className="button button-secondary"
                type="button"
                disabled={detail.isLoadingMore}
                onClick={() => void controller.loadMore()}
              >
                {detail.isLoadingMore ? 'Loading…' : 'Load more chapters'}
              </button>
            </div>
          ) : null}
        </section>
        ) : null}
        </div>
      </main>
    </div>
  );
}
