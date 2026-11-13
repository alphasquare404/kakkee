import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createReaderController } from '../../core/reader/readerController';
import { createReaderRepository } from '../../core/reader/readerRepository';
import { createTrackingSyncRepository } from '../../core/tracking/trackingSyncRepository';
import { getTrackingPreferences } from '../../core/preferences/trackingPreferences';
import type { ResourceService } from '../../core/resources/resourceService';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import { ActionMenu } from '../../shared/ActionMenu';
import {
  getNavigationOrigin,
  originHref,
  originLabel,
} from '../../app/navigationOrigin';
import { useImageResource } from '../../shared/useImageResource';
import { BackButton } from '../../shared/BackButton';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { IconChevron, IconList } from '../library/icons';
import { createOfflineStorage, isOfflineStorageSupported } from '../../core/offline/offlineStorage';
import { setMangaReaderOverride } from '../../core/preferences/mangaReaderOverrides';
import { MangaReaderModePicker } from '../manga/MangaReaderModePicker';

registerMessages('id', {
  Manga: 'Manga',
  Reader: 'Reader',
  Previous: 'Sebelumnya',
  Next: 'Berikutnya',
  Chapters: 'Chapter',
  'Download action failed': 'Aksi unduhan gagal',
  'Delete downloaded chapter': 'Hapus chapter terunduh',
  'Download chapter': 'Unduh chapter',
  'Delete download': 'Hapus unduhan',
  Download: 'Unduh',
  Bookmarked: 'Ditandai',
  Bookmark: 'Tandai',
  'In library': 'Di perpustakaan',
  'Add to library': 'Tambahkan ke perpustakaan',
  'Next queued': 'Berikutnya dalam antrean',
  'Download next': 'Unduh berikutnya',
  Fullscreen: 'Layar penuh',
  'Reader settings': 'Pengaturan reader',
  'Auto-scroll': 'Gulir otomatis',
  Share: 'Bagikan',
  "Couldn't load chapter": 'Tidak dapat memuat chapter',
  'The chapter request failed. Try again.':
    'Permintaan chapter gagal. Coba lagi.',
  "Couldn't load pages": 'Tidak dapat memuat halaman',
  'Chapter metadata loaded, but the page request failed.':
    'Metadata chapter dimuat, tetapi permintaan halaman gagal.',
  'Next chapter': 'Chapter berikutnya',
  'No pages': 'Tidak ada halaman',
  'This chapter returned no readable pages.':
    'Chapter ini tidak mengembalikan halaman yang bisa dibaca.',
  Read: 'Sudah dibaca',
});
import { useReaderSettings } from '../../shared/useReaderSettings';
import { useMangaReaderOverride } from '../../shared/useMangaReaderOverride';
import { buildReaderFilter } from '../../core/preferences/readerSettings';
import type { CSSProperties, MouseEvent, PointerEvent } from 'react';

function ReaderMoreIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="3" cy="8" r="1.15" />
      <circle cx="8" cy="8" r="1.15" />
      <circle cx="13" cy="8" r="1.15" />
    </svg>
  );
}

export function ReaderPage() {
  const { state } = useConnection();
  const { from } = useAppPath();
  const { mangaId, chapterId } = useParams();
  const manga = Number(mangaId);
  const chapter = Number(chapterId);

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

  if (
    !mangaId ||
    !chapterId ||
    !Number.isSafeInteger(manga) ||
    !Number.isSafeInteger(chapter) ||
    manga <= 0 ||
    chapter <= 0
  ) {
    return <Navigate to="/library" replace />;
  }

  return (
    <DeviceAwareReader
      context={state.context}
      mangaId={manga}
      chapterId={chapter}
    />
  );
}

function DeviceAwareReader({
  context,
  mangaId,
  chapterId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
  readonly chapterId: number;
}) {
  const storage = useMemo(() => createOfflineStorage(), []);
  const [hasDeviceCopy, setHasDeviceCopy] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOfflineStorageSupported()) {
      setHasDeviceCopy(false);
      return;
    }

    let active = true;

    void storage
      .list(context.config.serverBaseUrl)
      .then((records) => {
        if (active) {
          setHasDeviceCopy(
            records.some((record) => record.chapterId === chapterId),
          );
        }
      })
      .catch(() => {
        if (active) {
          setHasDeviceCopy(false);
        }
      });

    return () => {
      active = false;
    };
  }, [chapterId, context.config.serverBaseUrl, storage]);

  if (hasDeviceCopy === null) {
    return (
      <div className="app-shell reader-shell">
        <p className="reader-status" role="status">
          Loading chapter…
        </p>
      </div>
    );
  }

  if (hasDeviceCopy) {
    return <Navigate to={`/offline/read/${chapterId}`} replace />;
  }

  return (
    <ConnectedReader
      context={context}
      mangaId={mangaId}
      chapterId={chapterId}
    />
  );
}

function ConnectedReader({
  context,
  mangaId,
  chapterId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
  readonly chapterId: number;
}) {
  const { t } = useI18n();
  const repository = useMemo(
    () => createReaderRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createReaderController({ repository }),
    [repository],
  );
  const trackingSync = useMemo(
    () => createTrackingSyncRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const reader = useSyncExternalStore(controller.subscribe, controller.getState);
  const globalReaderSettings = useReaderSettings();
  const mangaOverride = useMangaReaderOverride(mangaId);
  const readerSettings = mangaOverride
    ? { ...globalReaderSettings, ...mangaOverride }
    : globalReaderSettings;
  const imageFilter = buildReaderFilter(readerSettings);
  const [searchParams] = useSearchParams();
  const loadedChapter = useRef<number | null>(null);
  const preloadedNext = useRef<number | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeHandled = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const origin = getNavigationOrigin(location.state);
  const resumeMode =
    (location.state as { resume?: 'start' | 'end' } | null)?.resume ?? null;
  const fromManga = Boolean(
    (location.state as { fromManga?: unknown } | null)?.fromManga,
  );
  const mangaState = useMemo(
    () => (origin ? { origin } : undefined),
    [origin],
  );
  const readerState = useMemo(
    () => ({
      ...(origin ? { origin } : {}),
      ...(fromManga ? { fromManga: true } : {}),
    }),
    [fromManga, origin],
  );
  const previousChapterState = useMemo(
    () => ({ ...readerState, resume: 'end' as const }),
    [readerState],
  );
  const nextChapterState = useMemo(
    () => ({ ...readerState, resume: 'start' as const }),
    [readerState],
  );
  const originCrumb = origin?.trail.at(-1);
  const backTarget =
    fromManga || !origin ? `/manga/${mangaId}` : originHref(origin);
  const backLabel = fromManga
    ? t('Manga')
    : originCrumb
      ? originLabel(originCrumb, t)
      : t('Manga');
  const goBack = useCallback(() => {
    navigate(backTarget, {
      replace: true,
      state: fromManga ? mangaState : undefined,
    });
  }, [backTarget, fromManga, mangaState, navigate]);
  const openReaderSettings = () => {
    if (!mangaOverride) {
      setMangaReaderOverride(mangaId, {
        mode: globalReaderSettings.mode,
        widthRem: globalReaderSettings.widthRem,
        gapPx: globalReaderSettings.gapPx,
        background: globalReaderSettings.background,
        filter: globalReaderSettings.filter,
        scale: globalReaderSettings.scale,
        direction: globalReaderSettings.direction,
        brightnessPct: globalReaderSettings.brightnessPct,
        contrastPct: globalReaderSettings.contrastPct,
        saturationPct: globalReaderSettings.saturationPct,
        stretchSmallPages: globalReaderSettings.stretchSmallPages,
      });
    }

    setReaderSettingsOpen(true);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [appendedNext, setAppendedNext] = useState<{
    readonly id: number;
    readonly name: string;
    readonly pages: readonly string[];
  } | null>(null);
  const [viewChapterId, setViewChapterId] = useState(chapterId);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [autoWebtoon, setAutoWebtoon] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [readerSettingsOpen, setReaderSettingsOpen] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [nextDownloadQueued, setNextDownloadQueued] = useState(false);
  const [pageColors, setPageColors] = useState<Record<number, string>>({});
  const chapterProgressRef = useRef({ chapterId: 0, page: 1, total: 0 });
  const syncedChapter = useRef(0);
  const deletedAfterReading = useRef(0);

  useEffect(() => {
    if (loadedChapter.current !== chapterId) {
      loadedChapter.current = chapterId;
      setCurrentPage(1);
      setAutoWebtoon(false);
      setAppendedNext(null);
      setViewChapterId(chapterId);
      preloadedNext.current = null;
      setNextDownloadQueued(false);
      void controller.load(chapterId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [chapterId, controller]);

  const chapter = reader.chapter;
  const activeChapter =
    chapter && chapter.id === chapterId ? chapter : null;
  const displayChapter =
    viewChapterId === activeChapter?.id
      ? activeChapter
      : appendedNext?.id === viewChapterId
        ? appendedNext
        : activeChapter;
  const displayChapterId = displayChapter?.id ?? activeChapter?.id ?? chapterId;
  const displayPageCount =
    viewChapterId === activeChapter?.id
      ? reader.pages.length
      : appendedNext?.pages.length ?? reader.pages.length;
  const explicitPage = searchParams.has('page')
    ? Number.parseInt(searchParams.get('page') ?? '1', 10)
    : null;
  const requestedPage = Math.max(
    1,
    explicitPage && explicitPage > 0
      ? explicitPage
      : (activeChapter?.lastPageRead ?? 0) + 1,
  );
  const readingMode = autoWebtoon ? 'webtoon' : readerSettings.mode;
  const isPaged = readingMode === 'single' || readingMode === 'double';
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    Math.max(1, displayPageCount),
  );
  const spreadStart =
    readingMode === 'double'
      ? Math.max(1, safeCurrentPage - ((safeCurrentPage - 1) % 2))
      : safeCurrentPage;
  const pageIndices = (
    isPaged
      ? readingMode === 'single'
        ? [spreadStart - 1]
        : readerSettings.direction === 'rtl'
          ? [spreadStart, spreadStart - 1]
          : [spreadStart - 1, spreadStart]
      : reader.pages.map((_, index) => index)
  ).filter((index) => index >= 0 && index < reader.pages.length);
  const pageLabel =
    readingMode === 'double'
      ? `${pageIndices.map((index) => index + 1).join('-')} / ${reader.pages.length}`
      : `${safeCurrentPage} / ${displayPageCount}`;
  const noopVisible = useCallback(() => undefined, []);

  useEffect(() => {
    const next = reader.nextChapter;

    if (
      !next ||
      preloadedNext.current === next.id ||
      reader.pages.length === 0 ||
      safeCurrentPage < reader.pages.length - 2
    ) {
      return;
    }

    preloadedNext.current = next.id;
    void controller.preload(next.id).then((pages) => {
      for (const path of pages.slice(0, 3)) {
        void context.resources
          .loadImageResource(path)
          .then((resource) => resource.dispose())
          .catch(() => undefined);
      }
    });
  }, [
    context.resources,
    controller,
    reader.nextChapter,
    reader.pages.length,
    safeCurrentPage,
  ]);

  const visibleChapters = readerSettings.skipDuplicates
    ? (() => {
        const currentNumber = activeChapter?.chapterNumber;
        const seen = new Set<number>();

        return reader.chapters.filter((item) => {
          if (seen.has(item.chapterNumber)) {
            return false;
          }

          // Keep the chapter the user is actually reading when duplicate
          // chapter numbers exist, even if another scanlator appears first.
          if (
            currentNumber !== undefined &&
            item.chapterNumber === currentNumber &&
            item.id !== chapterId
          ) {
            return false;
          }

          seen.add(item.chapterNumber);
          return true;
        });
      })()
    : reader.chapters;
  const currentChapterIndex = visibleChapters.findIndex(
    (item) => item.id === viewChapterId,
  );
  const previousChapter =
    currentChapterIndex >= 0
      ? visibleChapters[currentChapterIndex + 1] ?? null
      : reader.previousChapter;
  const nextChapter =
    currentChapterIndex >= 0
      ? visibleChapters[currentChapterIndex - 1] ?? null
      : reader.nextChapter;

  useEffect(() => {
    if (
      (readingMode !== 'vertical' && readingMode !== 'webtoon') ||
      appendedNext ||
      !nextChapter ||
      reader.pages.length === 0 ||
      viewChapterId !== activeChapter?.id
    ) {
      return;
    }

    if (safeCurrentPage < reader.pages.length) {
      return;
    }

    let active = true;
    void controller.preload(nextChapter.id).then((pages) => {
      if (active && pages.length > 0) {
        setAppendedNext({
          id: nextChapter.id,
          name: nextChapter.name,
          pages,
        });
      }
    });

    return () => {
      active = false;
    };
  }, [
    appendedNext,
    controller,
    nextChapter,
    reader.pages.length,
    readingMode,
    safeCurrentPage,
    viewChapterId,
    activeChapter?.id,
  ]);


  useEffect(() => {
    if (
      !readerSettings.deleteAfterReading ||
      !activeChapter?.isDownloaded ||
      reader.pages.length === 0 ||
      currentPage < reader.pages.length ||
      deletedAfterReading.current === activeChapter.id
    ) {
      return;
    }

    deletedAfterReading.current = activeChapter.id;
    void controller.deleteDownload(activeChapter.id).catch(() => undefined);
  }, [
    activeChapter,
    controller,
    currentPage,
    reader.pages.length,
    readerSettings.deleteAfterReading,
  ]);

  useEffect(() => {
    if (
      !readerSettings.autoAdvance ||
      !nextChapter ||
      reader.pages.length === 0 ||
      currentPage < displayPageCount
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate(`/manga/${mangaId}/chapter/${nextChapter.id}`, { state: nextChapterState });
    }, 1_200);

    return () => window.clearTimeout(timer);
  }, [
    currentPage,
    displayPageCount,
    mangaId,
    mangaState,
    navigate,
    nextChapter,
    nextChapterState,
    reader.pages.length,
    readerSettings.autoAdvance,
  ]);

  useEffect(() => {
    if (!readerSettings.keepScreenOn) {
      return;
    }

    const wakeLock = (
      navigator as Navigator & {
        wakeLock?: {
          request(type: 'screen'): Promise<{ release(): Promise<void> }>;
        };
      }
    ).wakeLock;

    if (!wakeLock) {
      return;
    }

    let sentinel: { release(): Promise<void> } | null = null;
    let disposed = false;

    void wakeLock
      .request('screen')
      .then((lock) => {
        if (disposed) {
          void lock.release();
          return;
        }

        sentinel = lock;
      })
      .catch(() => {
        // Wake Lock is optional and may be denied by the platform.
      });

    return () => {
      disposed = true;
      void sentinel?.release().catch(() => undefined);
    };
  }, [readerSettings.keepScreenOn]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  const shareChapter = () => {
    if (!activeChapter || !navigator.share) {
      return;
    }

    void navigator
      .share({
        title: `${activeChapter.manga.title} — ${activeChapter.name}`,
        url: window.location.href,
      })
      .catch(() => undefined);
  };

  const activeChapterId = activeChapter?.id ?? 0;

  useEffect(() => {
    chapterProgressRef.current = {
      chapterId: activeChapterId,
      page: currentPage,
      total: reader.pages.length,
    };
  }, [activeChapterId, currentPage, reader.pages.length]);

  useEffect(() => {
    const chapterAtMount = displayChapterId;

    return () => {
      const progress = chapterProgressRef.current;

      if (
        chapterAtMount <= 0 ||
        progress.chapterId !== chapterAtMount ||
        progress.total <= 0
      ) {
        return;
      }

      void controller
        .saveProgressForChapter(
          chapterAtMount,
          progress.page - 1,
          progress.page >= progress.total,
        )
        .catch(() => undefined);
    };
  }, [controller, displayChapterId]);

  useEffect(() => {
    if (
      resumeMode ||
      !activeChapterId ||
      reader.pages.length === 0 ||
      requestedPage <= 1 ||
      requestedPage > reader.pages.length
    ) {
      return;
    }

    setCurrentPage(requestedPage);
    const timer = window.setTimeout(() => {
      document
        .getElementById(`page-${requestedPage}`)
        ?.scrollIntoView({ block: 'start' });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [activeChapterId, reader.pages.length, requestedPage, resumeMode]);

  useEffect(() => {
    if (!resumeMode || !activeChapterId || reader.pages.length === 0) {
      return;
    }

    const targetPage = resumeMode === 'end' ? reader.pages.length : 1;
    setCurrentPage(targetPage);
    const timer = window.setTimeout(() => {
      document
        .getElementById(`page-${targetPage}`)
        ?.scrollIntoView({ block: resumeMode === 'end' ? 'end' : 'start' });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [activeChapterId, reader.pages.length, resumeMode]);

  useEffect(() => {
    if (!activeChapterId || reader.pages.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void controller
        .saveProgressForChapter(
          displayChapterId,
          currentPage - 1,
          currentPage >= displayPageCount,
        )
        .then(() => {
          if (
            displayChapterId === activeChapterId &&
            currentPage >= displayPageCount &&
            getTrackingPreferences().autoSync &&
            syncedChapter.current !== displayChapterId
          ) {
            syncedChapter.current = displayChapterId;
            void trackingSync.sync(mangaId).catch(() => undefined);
          }
        })
        .catch(() => undefined);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    activeChapterId,
    controller,
    currentPage,
    displayChapterId,
    displayPageCount,
    mangaId,
    reader.pages.length,
    trackingSync,
  ]);

  const handlePageVisible = useCallback(
    (pageNumber: number) => {
      const activePageCount = reader.pages.length;
      const appendedPage = pageNumber - activePageCount;
      const activeChapterId = activeChapter?.id ?? chapterId;

      if (appendedNext && appendedPage > 0) {
        setViewChapterId(appendedNext.id);
        setCurrentPage(Math.min(appendedNext.pages.length, appendedPage));
        return;
      }

      const atBottom =
        readingMode !== 'horizontal' &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;

      if (atBottom) {
        if (appendedNext) {
          setViewChapterId(appendedNext.id);
          setCurrentPage(appendedNext.pages.length);
        } else {
          setViewChapterId(activeChapterId);
          setCurrentPage(Math.max(1, activePageCount));
        }
        return;
      }

      setViewChapterId(activeChapterId);
      setCurrentPage(pageNumber);
    },
    [
      activeChapter,
      appendedNext,
      chapterId,
      reader.pages.length,
      readingMode,
    ],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === readerSettings.backKey) {
        event.preventDefault();

        if (chaptersOpen) {
          setChaptersOpen(false);
          return;
        }

        if (readerSettingsOpen) {
          setReaderSettingsOpen(false);
          return;
        }

        goBack();
        return;
      }

      const isPrevious = event.key === readerSettings.pagePrevKey;
      const isNext = event.key === readerSettings.pageNextKey;

      if (!isPrevious && !isNext) {
        return;
      }

      if (event.key === 'PageUp' || event.key === 'PageDown' || event.key === 'Backspace') {
        event.preventDefault();
      }

      if (isPaged && !event.shiftKey) {
        const step = readingMode === 'double' ? 2 : 1;
        const delta = isNext ? step : -step;

        setCurrentPage((page) =>
          Math.min(
            Math.max(1, page + delta),
            Math.max(1, reader.pages.length),
          ),
        );
        return;
      }

      if (readingMode === 'horizontal' && !event.shiftKey) {
        const nextPage = Math.min(
          Math.max(1, safeCurrentPage + (isNext ? 1 : -1)),
          Math.max(1, reader.pages.length),
        );

        setCurrentPage(nextPage);
        window.requestAnimationFrame(() => {
          document
            .getElementById(`page-${nextPage}`)
            ?.scrollIntoView({ inline: 'center', block: 'nearest' });
        });
        return;
      }

      if (isPrevious && previousChapter) {
        navigate(`/manga/${mangaId}/chapter/${previousChapter.id}`, { state: previousChapterState });
      }

      if (isNext && nextChapter) {
        navigate(`/manga/${mangaId}/chapter/${nextChapter.id}`, { state: nextChapterState });
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    chaptersOpen,
    readerSettingsOpen,
    goBack,
    isPaged,
    mangaId,
    mangaState,
    navigate,
    nextChapter,
    nextChapterState,
    previousChapterState,
    reader.pages.length,
    readerSettings.backKey,
    readerSettings.pageNextKey,
    readerSettings.pagePrevKey,
    previousChapter,
    readingMode,
    safeCurrentPage,
  ]);

  useEffect(() => {
    if (!autoScrolling) {
      return;
    }

    const timer = window.setInterval(() => {
      window.scrollBy(0, readerSettings.autoScrollSpeed);
    }, 45);

    const stop = () => setAutoScrolling(false);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
  }, [autoScrolling, readerSettings.autoScrollSpeed]);

  useEffect(() => {
    if (!activeChapter) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      '',
      `/manga/${mangaId}/chapter/${
        viewChapterId === activeChapter.id ? chapterId : viewChapterId
      }`,
    );
  }, [activeChapter, chapterId, mangaId, viewChapterId]);

  const selectPageFromTap = (event: MouseEvent<HTMLElement>) => {
    if (swipeHandled.current) {
      swipeHandled.current = false;
      return;
    }

    if (!isPaged) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - rect.left;
    const step = readingMode === 'double' ? 2 : 1;
    const isLeft = offset < rect.width / 3;
    const isRight = offset > (rect.width * 2) / 3;
    const goBack = readerSettings.direction === 'rtl' ? isRight : isLeft;
    const goForward = readerSettings.direction === 'rtl' ? isLeft : isRight;

    if (goBack) {
      setCurrentPage((page) => Math.max(1, page - step));
    } else if (goForward) {
      setCurrentPage((page) =>
        Math.min(Math.max(1, reader.pages.length), page + step),
      );
    }
  };

  const beginSwipe = (event: PointerEvent<HTMLElement>) => {
    if (!isPaged || event.pointerType === 'mouse') {
      return;
    }

    swipeStart.current = { x: event.clientX, y: event.clientY };
    swipeHandled.current = false;
  };

  const endSwipe = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;

    if (!start || !isPaged) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    swipeHandled.current = true;
    const step = readingMode === 'double' ? 2 : 1;
    const goForward =
      readerSettings.direction === 'rtl' ? deltaX > 0 : deltaX < 0;
    setCurrentPage((page) =>
      Math.min(
        Math.max(1, reader.pages.length),
        Math.max(1, page + (goForward ? step : -step)),
      ),
    );
  };

  return (
    <div
      className="app-shell reader-shell"
      style={
        {
          '--reader-width': `${readerSettings.widthRem}rem`,
          '--reader-gap': `${readerSettings.gapPx}px`,
          '--reader-bg':
            (readerSettings.autoBackground
              ? pageColors[safeCurrentPage]
              : undefined) ?? readerSettings.background,
          '--reader-first-offset': `${readerSettings.firstPageOffset}px`,
        } as CSSProperties
      }
    >
      <header className="reader-header">
        <BackButton
          to={backTarget}
          label={backLabel}
          state={fromManga ? mangaState : undefined}
          onClick={(event) => {
            event.preventDefault();
            goBack();
          }}
        />

        <div className="reader-title">
          <p title={activeChapter?.manga.title}>{activeChapter?.manga.title ?? t('Reader')}</p>
          <h1 title={displayChapter?.name}>{displayChapter?.name ?? 'Loading chapter…'}</h1>
          {displayChapter && displayPageCount > 0 ? (
            <span className="reader-page-total">{pageLabel}</span>
          ) : null}
        </div>

        <nav className="reader-chapter-nav" aria-label="Chapter navigation">
          {previousChapter ? (
            <Link
              className="reader-icon-button"
              to={`/manga/${mangaId}/chapter/${previousChapter.id}`}
              state={previousChapterState}
              aria-label={t('Previous chapter')}
              title={t('Previous chapter')}
            >
              <IconChevron className="reader-icon-prev" />
            </Link>
          ) : (
            <span
              className="reader-icon-button is-disabled"
              aria-disabled="true"
              aria-label={t('Previous chapter')}
              title={t('Previous chapter')}
            >
              <IconChevron className="reader-icon-prev" />
            </span>
          )}
          {nextChapter ? (
            <Link
              className="reader-icon-button"
              to={`/manga/${mangaId}/chapter/${nextChapter.id}`}
              state={nextChapterState}
              aria-label={t('Next chapter')}
              title={t('Next chapter')}
            >
              <IconChevron className="reader-icon-next" />
            </Link>
          ) : (
            <span
              className="reader-icon-button is-disabled"
              aria-disabled="true"
              aria-label={t('Next chapter')}
              title={t('Next chapter')}
            >
              <IconChevron className="reader-icon-next" />
            </span>
          )}
          <button
            className="reader-icon-button"
            type="button"
            aria-label={t('Chapters')}
            title={t('Chapters')}
            onClick={() => setChaptersOpen(true)}
          >
            <IconList />
          </button>
          <ActionMenu
            label={<ReaderMoreIcon />}
            ariaLabel={t('Reader actions')}
            summaryClassName="reader-icon-button"
          >
          <button
            className="reader-quick-action"
            type="button"
            disabled={!activeChapter || downloadBusy}
            title={
              downloadError
                ? t('Download action failed')
                : activeChapter?.isDownloaded
                  ? t('Delete downloaded chapter')
                  : t('Download chapter')
            }
            onClick={() => {
              if (!activeChapter) {
                return;
              }

              setDownloadError(false);
              setDownloadBusy(true);
              const action = activeChapter.isDownloaded
                ? controller.deleteDownload(activeChapter.id)
                : controller.downloadChapter(activeChapter.id);
              void action
                .catch(() => setDownloadError(true))
                .finally(() => setDownloadBusy(false));
            }}
          >
            {downloadBusy
              ? 'Working…'
              : activeChapter?.isDownloaded
                ? 'Delete download'
                : 'Download'}
          </button>
          <button
            className={`reader-quick-action${activeChapter?.isBookmarked ? ' is-active' : ''}`}
            type="button"
            disabled={!activeChapter || downloadBusy}
            onClick={() => {
              if (!activeChapter) {
                return;
              }

              setDownloadBusy(true);
              void controller
                .setBookmark(!activeChapter.isBookmarked)
                .catch(() => setDownloadError(true))
                .finally(() => setDownloadBusy(false));
            }}
          >
            {activeChapter?.isBookmarked ? t('Bookmarked') : t('Bookmark')}
          </button>
          <button
            className={`reader-quick-action${activeChapter?.manga.inLibrary ? ' is-active' : ''}`}
            type="button"
            disabled={!activeChapter || downloadBusy}
            onClick={() => {
              if (!activeChapter) {
                return;
              }

              setDownloadBusy(true);
              void controller
                .setInLibrary(!activeChapter.manga.inLibrary)
                .catch(() => setDownloadError(true))
                .finally(() => setDownloadBusy(false));
            }}
          >
            {activeChapter?.manga.inLibrary ? t('In library') : t('Add to library')}
          </button>
          {nextChapter ? (
            <button
              className="reader-quick-action"
              type="button"
              disabled={downloadBusy || nextDownloadQueued}
              onClick={() => {
                setDownloadError(false);
                setDownloadBusy(true);
                void controller
                  .downloadChapter(nextChapter.id)
                  .then(() => setNextDownloadQueued(true))
                  .catch(() => setDownloadError(true))
                  .finally(() => setDownloadBusy(false));
              }}
            >
              {nextDownloadQueued ? t('Next queued') : t('Download next')}
            </button>
          ) : null}
          <button
            className="reader-quick-action"
            type="button"
            onClick={openReaderSettings}
          >
            {t('Reader settings')}
          </button>
          <button
            className="reader-quick-action"
            type="button"
            onClick={toggleFullscreen}
          >
            {t('Fullscreen')}
          </button>
          <button
            className={`reader-quick-action${autoScrolling ? ' is-active' : ''}`}
            type="button"
            aria-pressed={autoScrolling}
            onClick={() => setAutoScrolling((value) => !value)}
          >
            {t('Auto-scroll')}
          </button>
          {typeof navigator.share === 'function' ? (
            <button
              className="reader-quick-action"
              type="button"
              onClick={shareChapter}
            >
              {t('Share')}
            </button>
          ) : null}
          </ActionMenu>
        </nav>

        {isPaged && activeChapter && reader.pages.length > 0 ? (
          <nav className="reader-page-nav" aria-label="Page navigation">
            <button
              type="button"
              disabled={spreadStart <= 1}
              onClick={() =>
                setCurrentPage(
                  Math.max(1, spreadStart - (readingMode === 'double' ? 2 : 1)),
                )
              }
            >
              Previous page
            </button>
            <span>
              Page {pageIndices.map((index) => index + 1).join('-')} of{' '}
              {reader.pages.length}
            </span>
            <button
              type="button"
              disabled={
                readingMode === 'double'
                  ? spreadStart + 1 >= reader.pages.length
                  : safeCurrentPage >= reader.pages.length
              }
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    reader.pages.length,
                    spreadStart + (readingMode === 'double' ? 2 : 1),
                  ),
                )
              }
            >
              Next page
            </button>
          </nav>
        ) : null}
      </header>


      {!activeChapter && !reader.error ? (
        <p className="reader-status" role="status">
          Loading chapter…
        </p>
      ) : null}

      {reader.error ? (
        <div className="library-state reader-state" role="alert">
          <h2>{t("Couldn't load chapter")}</h2>
          <p>{t('The chapter request failed. Try again.')}</p>
          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={() => void controller.load(chapterId)}
            >
              Retry
            </button>
            <BackButton
              to={backTarget}
              label={t('Back')}
              state={fromManga ? mangaState : undefined}
              onClick={(event) => {
                event.preventDefault();
                goBack();
              }}
            />
          </div>
        </div>
      ) : null}

      {activeChapter && reader.isLoadingPages ? (
        <div className="reader-pages" aria-busy="true" aria-label="Loading pages">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="reader-page reader-page-skeleton" key={index} />
          ))}
          <p className="reader-status" role="status">
            Loading pages…
          </p>
        </div>
      ) : null}

      {activeChapter && reader.pagesError ? (
        <div className="library-state reader-state" role="alert">
          <h2>{t("Couldn't load pages")}</h2>
          <p>{t('Chapter metadata loaded, but the page request failed.')}</p>
          <button
            className="button"
            type="button"
            onClick={() => void controller.retryPages()}
            disabled={reader.isLoadingPages}
          >
            Retry pages
          </button>
        </div>
      ) : null}

      {activeChapter && reader.pages.length > 0 ? (
        <main
          className={`reader-pages mode-${readingMode} scale-${readerSettings.scale}${
            readerSettings.stretchSmallPages ? ' stretch-small' : ''
          }${readerSettings.direction === 'rtl' ? ' is-rtl' : ''}`}
          aria-label={`${displayChapter?.name ?? activeChapter.name} pages`}
          onClick={selectPageFromTap}
          onPointerDown={beginSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
        >
          {pageIndices.map((index) => {
            const path = reader.pages[index];

            return path ? (
              <ReaderPageImage
                key={path}
                resources={context.resources}
                path={path}
                pageNumber={index + 1}
                eager={isPaged || Math.abs(index + 1 - safeCurrentPage) <= 1}
                filter={imageFilter}
                onVisible={isPaged ? noopVisible : handlePageVisible}
                onDimensions={(page, width, height) => {
                  if (
                    readerSettings.autoDetectWebtoon &&
                    page === 1 &&
                    width > 0 &&
                    height / width > 2.2
                  ) {
                    setAutoWebtoon(true);
                  }
                }}
                onColor={(page, color) =>
                  setPageColors((current) =>
                    current[page] === color
                      ? current
                      : { ...current, [page]: color },
                  )
                }
              />
            ) : null;
          })}
          {appendedNext ? (
            <section className="reader-appended">
              <div className="reader-appended-heading">
                <p>{t('Next chapter')}</p>
                <h2>{appendedNext.name}</h2>
                <Link
                  to={`/manga/${mangaId}/chapter/${appendedNext.id}`}
                  state={nextChapterState}
                >
                  {t('Open chapter')}
                </Link>
              </div>
              {appendedNext.pages.map((path, index) => (
                <ReaderPageImage
                  key={path}
                  resources={context.resources}
                  path={path}
                  pageNumber={reader.pages.length + index + 1}
                  eager={false}
                  filter={imageFilter}
                  onVisible={handlePageVisible}
                  onColor={(page, color) =>
                    setPageColors((current) =>
                      current[page] === color
                        ? current
                        : { ...current, [page]: color },
                    )
                  }
                />
              ))}
            </section>
          ) : null}
        </main>
      ) : null}

      {activeChapter &&
      !reader.isLoadingPages &&
      !reader.pagesError &&
      reader.pages.length === 0 ? (
        <div className="library-state reader-state">
          <h2>{t('No pages')}</h2>
          <p>{t('This chapter returned no readable pages.')}</p>
        </div>
      ) : null}

      {activeChapter ? (
        <footer className="reader-footer">
          <nav className="reader-chapter-nav" aria-label="Chapter navigation">
            {previousChapter ? (
              <Link to={`/manga/${mangaId}/chapter/${previousChapter.id}`} state={previousChapterState}>
                Previous: {previousChapter.name}
              </Link>
            ) : (
              <span aria-disabled="true">Previous</span>
            )}
            <span>
              {displayPageCount === 1
                ? '1 page'
                : `${displayPageCount} pages`}
            </span>
            {nextChapter ? (
              <Link to={`/manga/${mangaId}/chapter/${nextChapter.id}`} state={nextChapterState}>
                Next: {nextChapter.name}
              </Link>
            ) : (
              <span aria-disabled="true">Next</span>
            )}
          </nav>
        </footer>
      ) : null}

      {chaptersOpen && activeChapter ? (
        <div
          className="reader-chapter-overlay"
          role="presentation"
          onClick={() => setChaptersOpen(false)}
        >
          <section
            className="reader-chapter-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Chapter list"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>{t('Chapters')}</h2>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setChaptersOpen(false)}
              >
                Close
              </button>
            </header>
            <ol>
              {visibleChapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    className={chapter.id === displayChapterId ? 'is-current' : undefined}
                    to={`/manga/${mangaId}/chapter/${chapter.id}`}
                    state={readerState}
                    onClick={() => setChaptersOpen(false)}
                  >
                    <span>{chapter.name}</span>
                    {chapter.isRead ? <small>{t('Read')}</small> : null}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
      {readerSettingsOpen && activeChapter ? (
        <div
          className="reader-chapter-overlay"
          role="presentation"
          onClick={() => setReaderSettingsOpen(false)}
        >
          <section
            className="reader-chapter-dialog reader-settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('Reader settings')}
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>{t('Reader settings')}</h2>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setReaderSettingsOpen(false)}
              >
                Close
              </button>
            </header>
            <p className="reader-settings-note">
              Changes apply only to this manga.
            </p>
            <MangaReaderModePicker mangaId={mangaId} />
          </section>
        </div>
      ) : null}

    </div>
  );
}

function ReaderPageImage({
  resources,
  path,
  pageNumber,
  eager = false,
  filter = 'none',
  onVisible,
  onColor,
  onDimensions,
}: {
  readonly resources: ResourceService;
  readonly path: string;
  readonly pageNumber: number;
  readonly eager?: boolean;
  readonly filter?: string;
  readonly onVisible: (pageNumber: number) => void;
  readonly onColor?: (pageNumber: number, color: string) => void;
  readonly onDimensions?: (
    pageNumber: number,
    width: number,
    height: number,
  ) => void;
}) {
  const figure = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(pageNumber <= 2 || eager);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      onVisible(pageNumber);
      return;
    }

    const element = figure.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible(pageNumber);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  useEffect(() => {
    if (nearViewport) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const element = figure.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1200px 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [nearViewport]);

  const image = useImageResource(resources, nearViewport ? path : null);

  return (
    <figure className="reader-page" id={`page-${pageNumber}`} ref={figure}>
      {image.objectUrl ? (
        <img
          src={image.objectUrl}
          alt={`Page ${pageNumber}`}
          loading="lazy"
          decoding="async"
          style={{ filter }}
          onLoad={(event) => {
            onDimensions?.(
              pageNumber,
              event.currentTarget.naturalWidth,
              event.currentTarget.naturalHeight,
            );

            if (!onColor) {
              return;
            }

            try {
              const canvas = document.createElement('canvas');
              canvas.width = 1;
              canvas.height = 1;
              const context = canvas.getContext('2d', {
                willReadFrequently: true,
              });

              if (!context) {
                return;
              }

              context.drawImage(event.currentTarget, 0, 0, 1, 1);
              const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
              onColor(pageNumber, `rgb(${red} ${green} ${blue})`);
            } catch {
              // Canvas sampling is best-effort.
            }
          }}
        />
      ) : image.status === 'error' ? (
        <div className="reader-page-error" role="group" aria-label={`Page ${pageNumber}`}>
          <p>Page {pageNumber} couldn&apos;t be loaded.</p>
          <button className="button button-secondary" type="button" onClick={image.retry}>
            Retry page
          </button>
        </div>
      ) : (
        <div
          className="reader-page-loading"
          role={nearViewport ? 'status' : undefined}
          aria-hidden={nearViewport ? undefined : true}
        >
          {nearViewport ? `Page ${pageNumber}` : null}
        </div>
      )}
    </figure>
  );
}
