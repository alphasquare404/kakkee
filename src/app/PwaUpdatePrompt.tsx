import { usePwaUpdate } from './pwaUpdate';
import { useI18n } from '../shared/useI18n';
import { registerMessages } from '../shared/i18n';

registerMessages('id', {
  'A new version of the app is available. Reload to use the latest shell.':
    'Versi baru aplikasi tersedia. Muat ulang untuk memakai shell terbaru.',
  'The app shell is ready. Server data still requires a connection.':
    'Shell aplikasi siap dipakai. Data server tetap memerlukan koneksi.',
  'Update and reload': 'Update dan muat ulang',
  Close: 'Tutup',
});

export function PwaUpdatePrompt() {
  const { t } = useI18n();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = usePwaUpdate();

  if (!needRefresh && !offlineReady) {
    return null;
  }

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <aside className="pwa-update" role="status" aria-live="polite">
      <p>
        {needRefresh
          ? t(
              'A new version of the app is available. Reload to use the latest shell.',
            )
          : t(
              'The app shell is ready. Server data still requires a connection.',
            )}
      </p>
      <div className="actions">
        {needRefresh ? (
          <button
            className="button"
            type="button"
            onClick={() => {
              void updateServiceWorker(true);
            }}
          >
            {t('Update and reload')}
          </button>
        ) : null}
        <button className="button button-secondary" type="button" onClick={dismiss}>
          {t('Close')}
        </button>
      </div>
    </aside>
  );
}
