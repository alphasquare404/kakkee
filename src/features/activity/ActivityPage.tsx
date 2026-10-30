import { useEffect, useMemo } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import type { FeedChapter, FeedInput } from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { FeedRow } from '../../shared/FeedRow';
import { PageHeader } from '../../shared/PageHeader';
import { feedDay } from '../../shared/feedTime';
import { useConnection } from '../../app/useConnection';
import { createCatalogRepository } from '../../core/catalog/catalogRepository';
import { useSyncExternalStore } from 'react';

export interface ActivityPageProps {
  readonly title: string;
  readonly subtitle: string;
  readonly input: FeedInput;
  readonly emptyTitle: string;
  readonly emptyCopy: string;
  readonly detail: (chapter: FeedChapter) => string;
  readonly stateLabel?: (chapter: FeedChapter) => string | undefined;
  readonly summary?: (items: readonly FeedChapter[]) => string;
  readonly groupByDay?: boolean;
  readonly dedupeByManga?: boolean;
  readonly rowTo?: (chapter: FeedChapter) => string;
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
  detail,
  stateLabel,
  summary,
  groupByDay = false,
  dedupeByManga = false,
  rowTo,
}: ActivityPageProps & { readonly context: ConnectedContext }) {
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

  const items = feed.data?.items ?? [];
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
              : `Latest ${items.length} of ${feed.data.totalCount.toLocaleString('en-US')}`
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
          <h1>Couldn&apos;t load {title.toLowerCase()}</h1>
          <p>The request to your server failed.</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!feed.isLoading && !feed.error && items.length === 0 ? (
        <div className="library-state">
          <h1>{emptyTitle}</h1>
          <p>{emptyCopy}</p>
        </div>
      ) : null}

      {displayItems.length > 0 ? (
        <div className="feed-groups">
          {groups.map((group) => (
            <section className="feed-group" key={group.label || 'all'}>
              {group.label ? <h2>{group.label}</h2> : null}
              <div className="feed-list">
                {group.items.map((chapter) => (
                  <FeedRow
                    key={chapter.id}
                    chapter={chapter}
                    resources={context.resources}
                    detail={detail(chapter)}
                    stateLabel={stateLabel?.(chapter)}
                    to={rowTo?.(chapter)}
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
