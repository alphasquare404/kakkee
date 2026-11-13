import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'suwayomi.ghost-mode.v1';
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

let active = typeof window === 'undefined' ? false : read();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getGhostMode(): boolean {
  return active;
}

export function setGhostMode(next: boolean): void {
  active = next;

  try {
    if (next) {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // The in-memory mode still applies when storage is unavailable.
  }

  emit();
}

export function subscribeGhostMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGhostMode(): boolean {
  return useSyncExternalStore(subscribeGhostMode, getGhostMode, getGhostMode);
}
