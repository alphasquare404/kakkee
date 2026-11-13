import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  createOfflineStorage,
  type OfflineChapter,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { buildReaderFilter } from '../../core/preferences/readerSettings';
import { useMangaReaderOverride } from '../../shared/useMangaReaderOverride';
import { useReaderSettings } from '../../shared/useReaderSettings';
import { BackButton } from '../../shared/BackButton';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { MangaReaderModePicker } from '../manga/MangaReaderModePicker';
import { useGhostMode } from '../../core/preferences/ghostMode';
import {
  IconChevron,
  IconClose,
  IconGrid,
  IconList,
} from '../library/icons';

registerMessages('id', {
  'Offline reader': 'Reader offline',
  'Offline downloads': 'Unduhan offline',
  'Chapter not stored on this device.': 'Chapter tidak tersimpan di perangkat ini.',
  'Back to device library': 'Kembali ke pustaka perangkat',
  'Loading…': 'Memuat…',
  Previous: 'Sebelumnya',
  Next: 'Berikutnya',
  Chapters: 'Chapter',
  Pages: 'Halaman',
  'Page picker': 'Pilih halaman',
  'Reader settings': 'Pengaturan reader',
  Close: 'Tutup',
  'Previous chapter': 'Chapter sebelumnya',
  'Next chapter': 'Chapter berikutnya',
});

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 3.2v1.5M10 15.3v1.5M3.2 10h1.5M15.3 10h1.5M5.2 5.2l1.1 1.1M13.7 13.7l1.1 1.1M14.8 5.2l-1.1 1.1M6.3 13.7l-1.1 1.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function OfflineReaderPage() {
  const { t } = useI18n();
  const { chapterId: chapterIdParam = '' } = useParams();
  const chapterId = Number(chapterIdParam);
  const navigate = useNavigate();
  const storage = useMemo(() => createOfflineStorage(), []);
  const [chapter, setChapter] = useState<OfflineChapter | null>(null);
  const [siblings, setSiblings] = useState<readonly OfflineChapterRecord[]>([]);
  const [urls, setUrls] = useState<readonly string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsEpoch, setControlsEpoch] = useState(0);
  const ghostMode = useGhostMode();
  const [resumeReady, setResumeReady] = useState(false);
  const [searchParams] = useSearchParams();
  const seekbarTouching = useRef(false);
  const resumeApplied = useRef(false);
  const progressRef = useRef({ chapterId: 0, page: 1, total: 0 });
  const pointerNearEdge = useRef(false);
  const pageElements = useRef<Array<HTMLDivElement | null>>([]);
  const globalReaderSettings = useReaderSettings();
  const mangaOverride = useMangaReaderOverride(chapter?.mangaId ?? 0);
  const readerSettings = mangaOverride
    ? { ...globalReaderSettings, ...mangaOverride }
    : globalReaderSettings;
  const imageFilter = buildReaderFilter(readerSettings);

  useEffect(() => {
    let active = true;
    let created: string[] = [];

    void storage
      .get(chapterId)
      .then(async (value) => {
        if (!active) {
          return;
        }

        if (!value) {
          setStatus('error');
          return;
        }

        created = value.pages.map((page) => URL.createObjectURL(page));
        const all = await storage.list(value.serverBaseUrl);

        if (!active) {
          created.forEach((url) => URL.revokeObjectURL(url));
          return;
        }

        setChapter(value);
        setUrls(created);
        setSiblings(all.filter((item) => item.mangaId === value.mangaId));
        setCurrentPage(1);
        setResumeReady(false);
        resumeApplied.current = false;
        setStatus('ready');
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [chapterId, storage]);

  const ordered = [...siblings].sort(
    (left, right) => left.chapterNumber - right.chapterNumber,
  );
  const index = ordered.findIndex((item) => item.chapterId === chapterId);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;
  const readingMode = readerSettings.mode;
  const isPaged = readingMode === 'single' || readingMode === 'double';
  const step = readingMode === 'double' ? 2 : 1;
  const spreadStart = isPaged
    ? Math.max(1, currentPage - ((currentPage - 1) % (readingMode === 'double' ? 2 : 1)))
    : currentPage;
  const visiblePageIndices = isPaged
    ? (readingMode === 'double' ? [spreadStart - 1, spreadStart] : [spreadStart - 1])
        .filter((value) => value >= 0 && value < urls.length)
        .sort((left, right) => left - right)
    : urls.map((_, pageIndex) => pageIndex);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, urls.length));
  const explicitPage = searchParams.has('page')
    ? Number.parseInt(searchParams.get('page') ?? '1', 10)
    : null;
  const requestedPage = Math.max(
    1,
    explicitPage && explicitPage > 0
      ? explicitPage
      : (chapter?.lastPageRead ?? 0) + 1,
  );

  const showControls = () => {
    setControlsVisible(true);
    setControlsEpoch((value) => value + 1);
  };

  const restorePage = (page: number) => {
    const element = pageElements.current[page - 1];

    if (!element || element.getBoundingClientRect().height <= 0) {
      return false;
    }

    element.scrollIntoView({ block: 'start' });
    resumeApplied.current = true;
    setResumeReady(true);
    return true;
  };

  useEffect(() => {
    if (
      !controlsVisible ||
      !readerSettings.autoHideControls ||
      chaptersOpen ||
      pagesOpen ||
      settingsOpen
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!seekbarTouching.current) {
        setControlsVisible(false);
      }
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [
    chaptersOpen,
    controlsEpoch,
    controlsVisible,
    pagesOpen,
    readerSettings.autoHideControls,
    settingsOpen,
  ]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;

      if (current < lastScrollY - 6) {
        showControls();
      }

      lastScrollY = current;

      if (!isPaged && status === 'ready' && resumeApplied.current) {
        const middle = window.innerHeight / 2;
        let visible = 1;

        pageElements.current.forEach((element, pageIndex) => {
          if (!element) {
            return;
          }

          const rect = element.getBoundingClientRect();

          if (rect.top <= middle) {
            visible = pageIndex + 1;
          }
        });

        setCurrentPage(visible);
      }
    };
    const onMove = (event: PointerEvent) => {
      const nearEdge =
        event.clientY <= 56 || event.clientY >= window.innerHeight - 76;

      if (nearEdge && !pointerNearEdge.current) {
        showControls();
      }

      pointerNearEdge.current = nearEdge;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, [isPaged, status]);

  const jumpToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), Math.max(1, urls.length));
    setCurrentPage(target);
    showControls();

    if (!isPaged) {
      pageElements.current[target - 1]?.scrollIntoView({ block: 'start' });
    }
  };

  useEffect(() => {
    if (status !== 'ready' || urls.length === 0 || requestedPage > urls.length) {
      return;
    }

    if (requestedPage <= 1) {
      resumeApplied.current = true;
      setResumeReady(true);
      return;
    }

    resumeApplied.current = false;
    setResumeReady(false);
    setCurrentPage(requestedPage);
    const frame = window.requestAnimationFrame(() => restorePage(requestedPage));
    const timers = [600, 1_600, 3_000].map((delay) =>
      window.setTimeout(() => restorePage(requestedPage), delay),
    );

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [requestedPage, status, urls.length]);

  useEffect(() => {
    if (
      !chapter ||
      status !== 'ready' ||
      urls.length === 0 ||
      !resumeReady ||
      ghostMode
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void storage
        .updateProgress(
          chapter.chapterId,
          currentPage - 1,
          currentPage >= urls.length,
        )
        .catch(() => undefined);
    }, 750);

    return () => window.clearTimeout(timer);
  }, [
    chapter,
    currentPage,
    ghostMode,
    resumeReady,
    status,
    storage,
    urls.length,
  ]);

  useEffect(() => {
    progressRef.current = {
      chapterId: chapter?.chapterId ?? 0,
      page: currentPage,
      total: urls.length,
    };
  }, [chapter?.chapterId, currentPage, urls.length]);

  useEffect(() => {
    const currentChapterId = chapter?.chapterId ?? 0;

    return () => {
      const progress = progressRef.current;

      if (
        currentChapterId <= 0 ||
        progress.chapterId !== currentChapterId ||
        progress.total <= 0 ||
        !resumeApplied.current ||
        ghostMode
      ) {
        return;
      }

      void storage
        .updateProgress(
          currentChapterId,
          progress.page - 1,
          progress.page >= progress.total,
        )
        .catch(() => undefined);
    };
  }, [chapter?.chapterId, ghostMode, storage]);

  const handlePageTap = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - rect.left;
    const middle = offset > rect.width / 3 && offset < (rect.width * 2) / 3;

    if (middle) {
      setControlsVisible((value) => !value);
      return;
    }

    if (!isPaged) {
      return;
    }

    if (offset < rect.width / 3) {
      setCurrentPage((page) => Math.max(1, page - step));
    } else if (offset > (rect.width * 2) / 3) {
      setCurrentPage((page) => Math.min(urls.length, page + step));
    }
  };

  if (status === 'loading') {
    return (
      <div className="app-shell page-shell">
        <p className="settings-save-state" role="status">
          {t('Loading…')}
        </p>
      </div>
    );
  }

  if (status === 'error' || !chapter) {
    return (
      <div className="app-shell page-shell">
        <div className="library-state" role="alert">
          <BackButton to="/downloads/device" label={t('Back to device library')} />
          <h1>{t('Chapter not stored on this device.')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`app-shell reader-shell offline-reader${
        controlsVisible ? '' : ' is-chrome-hidden'
      }`}
      style={
        {
          '--reader-width': `${readerSettings.widthRem}rem`,
          '--reader-gap': `${readerSettings.gapPx}px`,
          '--reader-bg': readerSettings.background,
          '--reader-background': readerSettings.background,
        } as CSSProperties
      }
    >
      <header className="reader-header">
        <BackButton
          to={`/manga/${chapter.mangaId}`}
          label={t('Back to device library')}
        />
        <div className="reader-title">
          <p>{chapter.mangaTitle}</p>
          <h1>{chapter.chapterName}</h1>
        </div>
        <nav className="reader-chapter-nav" aria-label="Chapter navigation">
          <button
            className="reader-icon-button"
            type="button"
            aria-label={t('Chapters')}
            title={t('Chapters')}
            onClick={() => {
              showControls();
              setChaptersOpen(true);
            }}
          >
            <IconList />
          </button>
          <button
            className="reader-icon-button"
            type="button"
            aria-label={t('Pages')}
            title={t('Pages')}
            onClick={() => {
              showControls();
              setPagesOpen(true);
            }}
          >
            <IconGrid />
          </button>
          <button
            className="reader-icon-button"
            type="button"
            aria-label={t('Reader settings')}
            title={t('Reader settings')}
            onClick={() => {
              showControls();
              setSettingsOpen(true);
            }}
          >
            <SettingsIcon />
          </button>
        </nav>
      </header>

      <main
        className={`reader-pages offline-reader-pages mode-${readingMode} scale-${readerSettings.scale}${
          readerSettings.stretchSmallPages ? ' stretch-small' : ''
        }${readerSettings.direction === 'rtl' ? ' is-rtl' : ''}`}
        onClick={handlePageTap}
        style={{
          filter: imageFilter === 'none' ? undefined : imageFilter,
        }}
      >
        {visiblePageIndices.map((pageIndex, visibleIndex) => (
          <div
            className="reader-page"
            key={urls[pageIndex]}
            ref={(element) => {
              pageElements.current[pageIndex] = element;
            }}
            id={`offline-page-${pageIndex + 1}`}
          >
            <img
              src={urls[pageIndex]}
              alt={`${chapter.chapterName} page ${pageIndex + 1}`}
              loading={visibleIndex < 3 ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => {
                if (pageIndex + 1 === requestedPage && !resumeApplied.current) {
                  window.requestAnimationFrame(() => restorePage(pageIndex + 1));
                }
              }}
            />
          </div>
        ))}
      </main>

      <div
        className="reader-seekbar"
        onPointerDown={() => {
          seekbarTouching.current = true;
          showControls();
        }}
        onPointerUp={() => {
          seekbarTouching.current = false;
          setControlsEpoch((value) => value + 1);
        }}
        onPointerCancel={() => {
          seekbarTouching.current = false;
          setControlsEpoch((value) => value + 1);
        }}
      >
        {previous ? (
          <button
            className="reader-seekbar-chapter"
            type="button"
            aria-label={t('Previous chapter')}
            title={t('Previous chapter')}
            onClick={() => navigate(`/offline/read/${previous.chapterId}`)}
          >
            <IconChevron className="reader-icon-prev" />
          </button>
        ) : (
          <span className="reader-seekbar-chapter is-disabled" aria-disabled="true">
            <IconChevron className="reader-icon-prev" />
          </span>
        )}
        <input
          type="range"
          min={1}
          max={Math.max(1, urls.length)}
          value={safeCurrentPage}
          aria-label={t('Page picker')}
          onChange={(event) => jumpToPage(Number(event.target.value))}
        />
        <span>
          Page {safeCurrentPage} of {urls.length}
        </span>
        {next ? (
          <button
            className="reader-seekbar-chapter"
            type="button"
            aria-label={t('Next chapter')}
            title={t('Next chapter')}
            onClick={() => navigate(`/offline/read/${next.chapterId}`)}
          >
            <IconChevron className="reader-icon-next" />
          </button>
        ) : (
          <span className="reader-seekbar-chapter is-disabled" aria-disabled="true">
            <IconChevron className="reader-icon-next" />
          </span>
        )}
      </div>

      {chaptersOpen ? (
        <div className="reader-chapter-overlay" role="presentation" onClick={() => setChaptersOpen(false)}>
          <section
            className="reader-chapter-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Chapter list"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>{t('Chapters')}</h2>
              <button className="reader-dialog-close" type="button" aria-label={t('Close')} onClick={() => setChaptersOpen(false)}>
                <IconClose />
              </button>
            </header>
            <ol>
              {ordered.map((item) => (
                <li key={item.chapterId}>
                  <Link
                    className={item.chapterId === chapterId ? 'is-current' : undefined}
                    to={`/offline/read/${item.chapterId}`}
                    onClick={() => setChaptersOpen(false)}
                  >
                    {item.chapterName}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}

      {pagesOpen ? (
        <div className="reader-chapter-overlay" role="presentation" onClick={() => setPagesOpen(false)}>
          <section
            className="reader-chapter-dialog reader-pages-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('Page picker')}
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>{t('Pages')}</h2>
              <button className="reader-dialog-close" type="button" aria-label={t('Close')} onClick={() => setPagesOpen(false)}>
                <IconClose />
              </button>
            </header>
            <div className="reader-page-thumbnails">
              {urls.map((url, pageIndex) => (
                <button
                  className={pageIndex + 1 === safeCurrentPage ? 'is-current' : undefined}
                  key={url}
                  type="button"
                  aria-label={`Page ${pageIndex + 1}`}
                  onClick={() => {
                    jumpToPage(pageIndex + 1);
                    setPagesOpen(false);
                  }}
                >
                  <img src={url} alt="" loading="lazy" decoding="async" />
                  <span>{pageIndex + 1}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {settingsOpen ? (
        <div className="reader-chapter-overlay" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section
            className="reader-chapter-dialog reader-settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('Reader settings')}
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>{t('Reader settings')}</h2>
              <button className="reader-dialog-close" type="button" aria-label={t('Close')} onClick={() => setSettingsOpen(false)}>
                <IconClose />
              </button>
            </header>
            <p className="reader-settings-note">Changes apply only to this manga.</p>
            <MangaReaderModePicker mangaId={chapter.mangaId} />
          </section>
        </div>
      ) : null}

    </div>
  );
}

