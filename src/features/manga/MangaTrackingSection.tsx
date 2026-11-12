import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createMangaTrackingController } from '../../core/tracking/mangaTrackingController';
import {
  createMangaTrackingRepository,
  type TrackRecord,
} from '../../core/tracking/mangaTrackingRepository';
import { IconSearch, IconSync, IconUnlink } from '../library/icons';

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
        <div className="manga-track-heading-actions">
          <span>{tracking.records.length} linked</span>
          {tracking.records.length > 0 ? (
            <button
              className="library-action manga-track-sync"
              type="button"
              disabled={tracking.syncing}
              aria-label={tracking.syncing ? 'Syncing…' : 'Sync progress'}
              title={tracking.syncing ? 'Syncing…' : 'Sync progress'}
              onClick={() => void controller.syncProgress()}
            >
              <IconSync className={tracking.syncing ? 'is-spinning' : undefined} />
            </button>
          ) : null}
        </div>
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
          No tracker is linked to this manga. Search for it below or log in to a
          tracker in Settings.
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
            <span className="sr-only">Tracker</span>
            <select
              aria-label="Tracker"
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
            <span className="sr-only">Search title</span>
            <input
              aria-label="Search title"
              placeholder="Search title"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className="library-action manga-track-submit"
            type="submit"
            disabled={tracking.searching || !query.trim()}
            aria-label={tracking.searching ? 'Searching…' : 'Search tracker'}
            title={tracking.searching ? 'Searching…' : 'Search tracker'}
          >
            <IconSearch />
          </button>
          {selectedTracker?.supportsPrivateTracking ? (
            <label className="manga-track-private">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
              />
              <span>Private</span>
            </label>
          ) : null}
        </form>
      ) : tracking.records.length === 0 ? (
        <div className="manga-track-empty">
          <p className="settings-save-state">
            Log in to a tracker in Settings to link this manga.
          </p>
          <Link className="button button-secondary" to="/settings/tracking">
            Open tracking settings
          </Link>
        </div>
      ) : null}

      {tracking.searchResults.length > 0 ? (
        <ul className="manga-track-results">
          {tracking.searchResults.map((result) => (
            <li key={`${result.trackerId}-${result.remoteId}`}>
              <div>
                <strong>{result.title}</strong>
                <span>
                  {result.publishingStatus} · {result.totalChapters === 1 ? '1 chapter' : `${result.totalChapters} chapters`}
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

function readingDateInput(value: string): string {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }

  const milliseconds = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;

  return new Date(milliseconds).toISOString().slice(0, 10);
}

function readingDateEpoch(value: string): string {
  if (!value) {
    return '0';
  }

  const [year, month, day] = value.split('-').map(Number);
  const milliseconds = Date.UTC(year, month - 1, day);

  return String(Math.floor(milliseconds / 1000));
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
    startDate?: string;
    finishDate?: string;
  }) => void;
  readonly onUnbind: () => void;
}) {
  const ratingOptions = [...new Set(record.tracker.scores)];
  const numericRatings = ratingOptions
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const ratingLabel =
    numericRatings.length > 0
      ? `Rating (${Math.min(...numericRatings)}–${Math.max(...numericRatings)})`
      : 'Rating';

  if (
    record.displayScore &&
    !ratingOptions.includes(record.displayScore)
  ) {
    ratingOptions.unshift(record.displayScore);
  }

  return (
    <article className="manga-track-row">
      <div className="manga-track-main">
        <strong>{record.tracker.name}</strong>
        <span>{record.title}</span>
      </div>
      <label className="manga-track-field">
        <span>Status</span>
        <select
          aria-label={`${record.tracker.name} status`}
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
        <span>{ratingLabel}</span>
        <select
          value={record.displayScore}
          disabled={busy}
          aria-label={`${record.tracker.name} ${ratingLabel.toLowerCase()}`}
          onChange={(event) =>
            onUpdate({ scoreString: event.target.value })
          }
        >
          {ratingOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      {record.tracker.supportsReadingDates ? (
        <>
          <label className="manga-track-field">
            <span>Started</span>
            <input
              type="date"
              value={readingDateInput(record.startDate)}
              disabled={busy}
              aria-label={`${record.tracker.name} start date`}
              onChange={(event) =>
                onUpdate({ startDate: readingDateEpoch(event.target.value) })
              }
            />
          </label>
          <label className="manga-track-field">
            <span>Finished</span>
            <input
              type="date"
              value={readingDateInput(record.finishDate)}
              disabled={busy}
              aria-label={`${record.tracker.name} finish date`}
              onChange={(event) =>
                onUpdate({ finishDate: readingDateEpoch(event.target.value) })
              }
            />
          </label>
        </>
      ) : null}
      <button
        className="library-action manga-track-unlink"
        type="button"
        disabled={busy}
        aria-label={busy ? 'Unlinking…' : 'Unlink tracker'}
        title={busy ? 'Unlinking…' : 'Unlink tracker'}
        onClick={onUnbind}
      >
        <IconUnlink />
      </button>
    </article>
  );
}

