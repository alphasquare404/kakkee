import { useEffect, useState } from 'react';
import { usePwaUpdate } from './pwaUpdate';
import { useI18n } from '../shared/useI18n';
import { registerMessages } from '../shared/i18n';

const UPDATE_NOTICE_KEY = 'kakkee.pwa.updated.v1';

registerMessages('id', {
  'Kakkee updated to the latest version.':
    'Kakkee sudah diperbarui ke versi terbaru.',
});

export function PwaUpdatePrompt() {
  const { t } = useI18n();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = usePwaUpdate();
  const [updated, setUpdated] = useState(() => {
    try {
      return window.sessionStorage.getItem(UPDATE_NOTICE_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Updates are automatic and silent; the user only sees a completion notice.
  useEffect(() => {
    if (!needRefresh) {
      return;
    }

    try {
      window.sessionStorage.setItem(UPDATE_NOTICE_KEY, '1');
    } catch {
      // The update still proceeds if session storage is unavailable.
    }

    void updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    if (!updated) {
      return;
    }

    try {
      window.sessionStorage.removeItem(UPDATE_NOTICE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }

    const timer = window.setTimeout(() => setUpdated(false), 7_000);
    return () => window.clearTimeout(timer);
  }, [updated]);

  if (!updated) {
    return null;
  }

  return (
    <aside className="pwa-update" role="status" aria-live="polite">
      <p>{t('Kakkee updated to the latest version.')}</p>
    </aside>
  );
}
