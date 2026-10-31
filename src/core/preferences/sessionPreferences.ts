const STORAGE_KEY = 'suwayomi.remembered-session.v1';

export interface RememberedSession {
  readonly serverUrl: string;
  readonly refreshToken: string;
}

export function getRememberedSession(): RememberedSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<RememberedSession>;

    if (
      typeof parsed.serverUrl !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      !parsed.serverUrl ||
      !parsed.refreshToken
    ) {
      return null;
    }

    return {
      serverUrl: parsed.serverUrl,
      refreshToken: parsed.refreshToken,
    };
  } catch {
    return null;
  }
}

export function saveRememberedSession(
  serverUrl: string,
  refreshToken: string,
): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ serverUrl, refreshToken }),
    );
  } catch {
    // Session persistence is optional.
  }
}

export function clearRememberedSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
