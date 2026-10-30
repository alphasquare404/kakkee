export interface LoadableState<T> {
  readonly data: T | null;
  readonly isLoading: boolean;
  readonly error: unknown | null;
}

export interface LoadableController<T> {
  getState(): LoadableState<T>;
  subscribe(listener: (state: LoadableState<T>) => void): () => void;
  load(): Promise<void>;
}

export interface LoadableControllerOptions<T> {
  readonly load: () => Promise<T>;
}

export function createLoadableController<T>(
  options: LoadableControllerOptions<T>,
): LoadableController<T> {
  let state: LoadableState<T> = { data: null, isLoading: false, error: null };
  let generation = 0;
  const listeners = new Set<(state: LoadableState<T>) => void>();

  function setState(next: LoadableState<T>): void {
    state = next;

    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function load(): Promise<void> {
    const requestGeneration = ++generation;

    setState({ data: state.data, isLoading: true, error: null });

    return (async () => {
      try {
        const data = await options.load();

        if (requestGeneration !== generation) {
          return;
        }

        setState({ data, isLoading: false, error: null });
      } catch (error) {
        if (requestGeneration !== generation) {
          return;
        }

        setState({ data: state.data, isLoading: false, error });
      }
    })();
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    load,
  };
}
