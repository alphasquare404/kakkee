import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createLibraryUpdateRepository } from '../../core/library/libraryUpdateRepository';
import type { LibraryUpdateInfo } from '../../core/library/libraryUpdateRepository';
import { LibraryUpdateStatusChangedDocument } from '../../core/graphql/generated/graphql';

interface State {
  readonly running: boolean;
  readonly started: boolean;
  readonly total: number;
  readonly finished: number;
  readonly error: boolean;
}

export function LibrarySyncButton({
  context,
  className = 'button button-secondary',
  onComplete,
}: {
  readonly context: ConnectedContext;
  readonly className?: string;
  readonly onComplete?: () => void;
}) {
  const store = useMemo(() => {
    let state: State = {
      running: false,
      started: false,
      total: 0,
      finished: 0,
      error: false,
    };
    const listeners = new Set<() => void>();
    const repository = createLibraryUpdateRepository({
      getClient: () => context.graphQL,
    });
    const notify = () => {
      for (const listener of [...listeners]) {
        listener();
      }
    };

    return {
      subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      getState: () => state,
      update(info: LibraryUpdateInfo) {
        state = {
          ...state,
          running: info.isRunning,
          total: info.totalJobs,
          finished: info.finishedJobs,
          error: false,
        };
        notify();
      },
      async start() {
        state = { ...state, running: true, error: false };
        notify();

        try {
          const info = await repository.start();
          state = {
            running: false,
            started: true,
            total: info.totalJobs,
            finished: info.finishedJobs,
            error: false,
          };
        } catch {
          state = { ...state, running: false, error: true };
        }

        notify();
      },
    };
  }, [context.graphQL]);
  const state = useSyncExternalStore(store.subscribe, store.getState);
  const previousRunning = useRef(false);

  useEffect(() => {
    if (previousRunning.current && !state.running && state.started) {
      onComplete?.();
    }

    previousRunning.current = state.running;
  }, [onComplete, state.running, state.started]);

  useEffect(() => {
    if (typeof context.graphQL.subscribe !== 'function') {
      return;
    }

    const subscription = context.graphQL
      .subscribe({
        query: LibraryUpdateStatusChangedDocument,
      })
      .subscribe({
        next: (result) => {
          const info = result.data?.libraryUpdateStatusChanged.jobsInfo;

          if (info) {
            store.update(info);
          }
        },
        error: () => undefined,
      });

    return () => subscription.unsubscribe();
  }, [context.graphQL, store]);

  return (
    <button
      className={className}
      type="button"
      disabled={state.running}
      onClick={() => void store.start()}
      title={state.started ? `Update queued: ${state.total} jobs` : 'Update library'}
    >
      {state.running
        ? `Updating ${state.finished}/${state.total}`
        : state.error
          ? 'Retry sync'
          : state.started
            ? `Sync queued (${state.total})`
            : 'Sync library'}
    </button>
  );
}
