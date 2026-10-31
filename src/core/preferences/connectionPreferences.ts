const STORAGE_KEY = 'suwayomi.last-server.v1';

export function getLastServerUrl(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveLastServerUrl(serverUrl: string): void {
  const value = serverUrl.trim();

  if (!value) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Remembering the server is optional.
  }
}

export function clearLastServerUrl(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
