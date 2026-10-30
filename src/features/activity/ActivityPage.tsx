import { useEffect, useMemo } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import type { FeedChapter, FeedInput } from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { FeedRow } from '../../shared/FeedRow';
import { PageHeader } from '../../shared/PageHeader';
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

      {items.length > 0 ? (
        <div className="feed-list">
          {items.map((chapter) => (
            <FeedRow
              key={chapter.id}
              chapter={chapter}
              resources={context.resources}
              detail={detail(chapter)}
              stateLabel={stateLabel?.(chapter)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
