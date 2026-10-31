const STORAGE_KEY = 'suwayomi.last-server.v1';
const AUTO_CONNECT_KEY = 'suwayomi.auto-connect.v1';

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

export function getAutoConnect(): boolean {
  try {
    return window.localStorage.getItem(AUTO_CONNECT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAutoConnect(value: boolean): void {
  try {
    window.localStorage.setItem(AUTO_CONNECT_KEY, String(value));
  } catch {
    // Auto-connect remains opt-in.
  }
}
