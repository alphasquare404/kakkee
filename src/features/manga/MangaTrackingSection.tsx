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
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
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

  useEffect(() => {
    void controller.load(mangaId);
  }, [controller, mangaId]);

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
