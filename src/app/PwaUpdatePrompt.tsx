import { usePwaUpdate } from './pwaUpdate';

export function PwaUpdatePrompt() {
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
          ? 'Versi baru aplikasi tersedia. Muat ulang untuk memakai shell terbaru.'
          : 'Shell aplikasi siap dipakai. Data server tetap memerlukan koneksi.'}
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
            Update dan reload
          </button>
        ) : null}
        <button className="button button-secondary" type="button" onClick={dismiss}>
          Tutup
        </button>
      </div>
    </aside>
  );
}
