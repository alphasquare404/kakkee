import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createMangaTrackingController } from '../../core/tracking/mangaTrackingController';
import {
  createMangaTrackingRepository,
  type TrackRecord,
} from '../../core/tracking/mangaTrackingRepository';

export function MangaTrackingSection({
  context,
  mangaId,
  mangaTitle,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
  readonly mangaTitle: string;
}) {
  const controller = useMemo(
    () =>
      createMangaTrackingController(
        createMangaTrackingRepository({
          getClient: () => context.graphQL,
        }),
      ),
    [context.graphQL],
  );
  const tracking = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
  );
  const [trackerId, setTrackerId] = useState<number | null>(null);
  const [query, setQuery] = useState(mangaTitle);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    void controller.load(mangaId);
  }, [controller, mangaId]);

  const linkedTrackerIds = new Set(tracking.records.map((record) => record.trackerId));
  const availableTrackers = tracking.trackers.filter(
    (tracker) => tracker.isLoggedIn && !linkedTrackerIds.has(tracker.id),
  );
  const selectedTracker =
    availableTrackers.find((tracker) => tracker.id === trackerId) ??
    availableTrackers[0];

  return (
    <section className="manga-tracking" aria-labelledby="manga-tracking-heading">
      <div className="section-heading-row">
        <h2 id="manga-tracking-heading">Tracking</h2>
        <span>{tracking.records.length} linked</span>
      </div>

      {tracking.error ? (
        <p className="settings-inline-error" role="alert">
          Tracking change was rejected by the server.
        </p>
      ) : null}

      {tracking.status === 'loading' && tracking.records.length === 0 ? (
        <p className="settings-save-state" role="status">
          Loading tracker records…
        </p>
      ) : null}

      {tracking.status === 'ready' && tracking.records.length === 0 ? (
        <p className="settings-save-state">
          No tracker is linked to this manga. Search-and-bind is not implemented
          yet.
        </p>
      ) : null}

      {tracking.records.length > 0 ? (
        <div className="manga-tracking-list">
          {tracking.records.map((record) => (
            <TrackRecordRow
              key={record.id}
              record={record}
              busy={tracking.busyId === record.id}
              onUpdate={(patch) => void controller.update(record.id, patch)}
              onUnbind={() => void controller.unbind(record.id)}
            />
          ))}
        </div>
      ) : null}

      {availableTrackers.length > 0 ? (
        <form
          className="manga-track-bind"
          onSubmit={(event) => {
            event.preventDefault();

            if (selectedTracker) {
              void controller.search(selectedTracker.id, query);
            }
          }}
        >
          <label>
            <span>Tracker</span>
            <select
              value={selectedTracker?.id ?? ''}
              onChange={(event) => setTrackerId(Number(event.target.value))}
            >
              {availableTrackers.map((tracker) => (
                <option key={tracker.id} value={tracker.id}>
                  {tracker.name}
                </option>
              ))}
            </select>
          </label>
          <label className="manga-track-search">
            <span>Search title</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className="library-action"
            type="submit"
            disabled={tracking.searching || !query.trim()}
          >
            {tracking.searching ? 'Searching…' : 'Search tracker'}
          </button>
          {selectedTracker?.supportsPrivateTracking ? (
            <label className="manga-track-private">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
              />
              Private
            </label>
          ) : null}
        </form>
      ) : (
        <p className="settings-save-state">
          Log in to a tracker in Settings to link this manga.
        </p>
      )}

      {tracking.searchResults.length > 0 ? (
        <ul className="manga-track-results">
          {tracking.searchResults.map((result) => (
            <li key={`${result.trackerId}-${result.remoteId}`}>
              <div>
                <strong>{result.title}</strong>
                <span>
                  {result.publishingStatus} · {result.totalChapters} chapters
                </span>
              </div>
              <button
                className="library-action"
                type="button"
                disabled={tracking.busyId !== null}
                onClick={() =>
                  void controller.bind(
                    result.trackerId,
                    result.remoteId,
                    isPrivate,
                  )
                }
              >
                Bind
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function TrackRecordRow({
  record,
  busy,
  onUpdate,
  onUnbind,
}: {
  readonly record: TrackRecord;
  readonly busy: boolean;
  readonly onUpdate: (patch: {
    status?: number;
    scoreString?: string;
  }) => void;
  readonly onUnbind: () => void;
}) {
  const [score, setScore] = useState(record.displayScore);

  useEffect(() => {
    setScore(record.displayScore);
  }, [record.displayScore]);

  const commitScore = () => {
    if (score !== record.displayScore) {
      onUpdate({ scoreString: score });
    }
  };

  return (
    <article className="manga-track-row">
      <div className="manga-track-main">
        <strong>{record.tracker.name}</strong>
        <span>{record.title}</span>
      </div>
      <label className="manga-track-field">
        <span>Status</span>
        <select
          value={record.status}
          disabled={busy}
          onChange={(event) => onUpdate({ status: Number(event.target.value) })}
        >
          {record.tracker.statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.name}
            </option>
          ))}
        </select>
      </label>
      <label className="manga-track-field">
        <span>Score</span>
        <input
          value={score}
          disabled={busy}
          aria-label={`${record.tracker.name} score`}
          onChange={(event) => setScore(event.target.value)}
          onBlur={commitScore}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitScore();
              event.currentTarget.blur();
            }
          }}
        />
      </label>
      <button
        className="library-action"
        type="button"
        disabled={busy}
        onClick={onUnbind}
      >
        {busy ? 'Working…' : 'Unlink'}
      </button>
    </article>
  );
}
