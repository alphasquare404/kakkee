import { usePwaUpdate } from './pwaUpdate';
import { useI18n } from '../shared/useI18n';
import { registerMessages } from '../shared/i18n';

registerMessages('id', {
  'A new version is available. Reload to update.':
    'Versi baru tersedia. Muat ulang untuk memperbarui.',
  'The app shell is ready. Server data still requires a connection.':
    'Shell aplikasi siap dipakai. Data server tetap memerlukan koneksi.',
  'Update and reload': 'Update dan muat ulang',
  Close: 'Tutup',
});

export function PwaUpdatePrompt() {
  const { t } = useI18n();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = usePwaUpdate();

  if (!needRefresh) {
    return null;
  }

  const dismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <aside className="pwa-update" role="status" aria-live="polite">
      <p>
        {t('A new version is available. Reload to update.')}
      </p>
      <div className="actions">
        <button
          className="button"
          type="button"
          onClick={() => {
            void updateServiceWorker(true);
          }}
        >
          {t('Update and reload')}
        </button>
        <button className="button button-secondary" type="button" onClick={dismiss}>
          {t('Close')}
        </button>
      </div>
    </aside>
  );
}
