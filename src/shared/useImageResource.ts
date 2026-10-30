import { useCallback, useEffect, useState } from 'react';
import type {
  LoadedResource,
  ResourceService,
} from '../core/resources/resourceService';

export type ImageResourceStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ImageResourceState {
  readonly status: ImageResourceStatus;
  readonly objectUrl: string | null;
  readonly error: unknown | null;
  retry(): void;
}

function isAbort(error: unknown): boolean {
  return (
    (error instanceof Error && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: unknown }).name === 'AbortError')
  );
}

/**
 * Loads a private image path through ResourceService and owns its object URL.
 * The URL is revoked on path change, retry, and unmount.
 */
export function useImageResource(
  resources: ResourceService,
  path: string | null | undefined,
): ImageResourceState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    path: string | null;
    resources: ResourceService | null;
    status: ImageResourceStatus;
    objectUrl: string | null;
    error: unknown | null;
  }>({
    path: null,
    resources: null,
    status: 'idle',
    objectUrl: null,
    error: null,
  });

  useEffect(() => {
    if (!path) {
      setState({
        path: null,
        resources,
        status: 'idle',
        objectUrl: null,
        error: null,
      });
      return;
    }

    let active = true;
    let loaded: LoadedResource | null = null;
    const controller = new AbortController();

    setState({
      path,
      resources,
      status: 'loading',
      objectUrl: null,
      error: null,
    });

    void resources
      .loadImageResource(path, { signal: controller.signal })
      .then((resource) => {
        if (!active) {
          resource.dispose();
          return;
        }

        loaded = resource;
        setState({
          path,
          resources,
          status: 'ready',
          objectUrl: resource.objectUrl,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted || isAbort(error)) {
          return;
        }

        setState({
          path,
          resources,
          status: 'error',
          objectUrl: null,
          error,
        });
      });

    return () => {
      active = false;
      controller.abort();
      loaded?.dispose();
    };
  }, [attempt, path, resources]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  if (state.path !== path || state.resources !== resources) {
    return {
      status: path ? 'loading' : 'idle',
      objectUrl: null,
      error: null,
      retry,
    };
  }

  return {
    status: state.status,
    objectUrl: state.objectUrl,
    error: state.error,
    retry,
  };
}
