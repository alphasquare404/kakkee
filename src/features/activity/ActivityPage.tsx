import { useEffect, useMemo, type ReactNode } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import type { FeedChapter, FeedInput } from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { FeedRow } from '../../shared/FeedRow';
import { PageHeader } from '../../shared/PageHeader';
import { feedDay } from '../../shared/feedTime';
import { useConnection } from '../../app/useConnection';
import type { NavigationOrigin } from '../../app/navigationOrigin';
import { createCatalogRepository } from '../../core/catalog/catalogRepository';
import { useSyncExternalStore } from 'react';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Latest {shown} of {total}': 'Terbaru {shown} dari {total}',
  'Couldn’t load {title}': 'Tidak dapat memuat {title}',
  'The request to your server failed.': 'Permintaan ke server gagal.',
  Retry: 'Coba lagi',
  Today: 'Hari ini',
  Yesterday: 'Kemarin',
  Earlier: 'Sebelumnya',
});

export interface ActivityPageProps {
  readonly title: string;
  readonly subtitle: string;
  readonly input: FeedInput;
  readonly emptyTitle: string;
  readonly emptyCopy: string;
  readonly emptyAction?: ReactNode;
  readonly detail: (chapter: FeedChapter) => string;
  readonly stateLabel?: (chapter: FeedChapter) => string | undefined;
  readonly summary?: (items: readonly FeedChapter[]) => string;
  readonly groupByDay?: boolean;
  readonly dedupeByManga?: boolean;
  readonly rowTo?: (chapter: FeedChapter) => string;
  readonly origin: NavigationOrigin;
  readonly itemFilter?: (chapter: FeedChapter) => boolean;
}

export function ActivityPage(props: ActivityPageProps) {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ActivityContent context={state.context} {...props} />;
}

function ActivityContent({
  context,
  title,
  subtitle,
  input,
  emptyTitle,
  emptyCopy,
  emptyAction,
  detail,
  stateLabel,
  summary,
  groupByDay = false,
  dedupeByManga = false,
  rowTo,
  origin,
  itemFilter,
}: ActivityPageProps & { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const repository = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createLoadableController({ load: () => repository.getFeed(input) }),
    [input, repository],
  );
  const feed = useSyncExternalStore(controller.subscribe, controller.getState);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const items = (feed.data?.items ?? []).filter((chapter) =>
    itemFilter ? itemFilter(chapter) : true,
  );
  const seenManga = new Set<number>();
  const displayItems = dedupeByManga
    ? items.filter((chapter) => {
        if (seenManga.has(chapter.manga.id)) {
          return false;
        }

        seenManga.add(chapter.manga.id);
        return true;
      })
    : items;
  const groups = groupByDay
    ? displayItems.reduce<Array<{ label: string; items: FeedChapter[] }>>(
        (result, chapter) => {
          const label = feedDay(chapter.lastReadAt);
          const current = result.at(-1);

          if (current?.label === label) {
            current.items.push(chapter);
          } else {
            result.push({ label, items: [chapter] });
          }

          return result;
        },
        [],
      )
    : [{ label: '', items: [...displayItems] }];

  return (
    <div className="app-shell page-shell feed-shell">
      <PageHeader
        title={title}
        subtitle={subtitle}
        count={
          feed.data
            ? summary
              ? summary(items)
              : t('Latest {shown} of {total}', {
                  shown: items.length,
                  total: feed.data.totalCount.toLocaleString('en-US'),
                })
            : undefined
        }
      />

      {feed.isLoading && !feed.data ? (
        <div className="feed-skeleton" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="feed-skeleton-row" key={index} />
          ))}
        </div>
      ) : null}

      {feed.error && !feed.data ? (
        <div className="library-state" role="alert">
          <h1>
            {t('Couldn’t load {title}', { title: title.toLowerCase() })}
          </h1>
          <p>{t('The request to your server failed.')}</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {!feed.isLoading && !feed.error && items.length === 0 ? (
        <div className="library-state">
          <h1>{emptyTitle}</h1>
          <p>{emptyCopy}</p>
          {emptyAction ? <div className="actions">{emptyAction}</div> : null}
        </div>
      ) : null}

      {displayItems.length > 0 ? (
        <div className="feed-groups">
          {groups.map((group) => (
            <section className="feed-group" key={group.label || 'all'}>
              {group.label ? <h2>{t(group.label)}</h2> : null}
              <div className="feed-list">
                {group.items.map((chapter) => (
                  <FeedRow
                    key={chapter.id}
                    chapter={chapter}
                    resources={context.resources}
                    detail={detail(chapter)}
                    stateLabel={stateLabel?.(chapter)}
                    to={rowTo?.(chapter)}
                    state={{ origin }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
