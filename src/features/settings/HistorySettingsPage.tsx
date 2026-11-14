import { updateHistoryPreferences } from '../../core/preferences/historyPreferences';
import { clearHiddenHistory } from '../../core/preferences/hiddenHistory';
import { setGhostMode, useGhostMode } from '../../core/preferences/ghostMode';
import { useHiddenHistory } from '../../shared/useHiddenHistory';
import { useHistoryPreferences } from '../../shared/useHistoryPreferences';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  'History settings': 'Pengaturan riwayat',
  'Reading history display': 'Tampilan riwayat bacaan',
  'Show hidden history': 'Tampilkan history tersembunyi',
  'Include entries hidden from Continue Reading':
    'Sertakan entri yang disembunyikan dari Lanjut Membaca',
  'Ghost mode': 'Mode ghost',
  'Do not write new reading history while active':
    'Jangan tulis history bacaan baru saat aktif',
  'All settings': 'Semua pengaturan',
  Display: 'Tampilan',
  'Hide read entries': 'Sembunyikan entri yang sudah dibaca',
  'This only hides read entries in this client. The server continues to record history.':
    'Ini hanya menyembunyikan entri yang dibaca di klien ini. Server tetap mencatat riwayat.',
  'Hidden entries': 'Entri tersembunyi',
  'Restore hidden history': 'Pulihkan riwayat tersembunyi',
  '{count} hidden': '{count} tersembunyi',
});

export function HistorySettingsPage() {
  const preferences = useHistoryPreferences();
  const hidden = useHiddenHistory();
  const ghostMode = useGhostMode();
  const { t } = useI18n();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('History settings')}
        subtitle={t('Reading history display')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="history-display">
          <div className="section-heading-row">
            <h2 id="history-display">{t('Display')}</h2>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <span>{t('Hide read entries')}</span>
              <input
                type="checkbox"
                checked={preferences.hideRead}
                onChange={(event) =>
                  updateHistoryPreferences({ hideRead: event.target.checked })
                }
              />
            </label>
            <label className="settings-toggle">
              <span>{t('Show hidden history')}</span>
              <input
                type="checkbox"
                checked={preferences.showHiddenHistory}
                onChange={(event) =>
                  updateHistoryPreferences({
                    showHiddenHistory: event.target.checked,
                  })
                }
              />
            </label>
            <label className="settings-toggle">
              <span>{t('Ghost mode')}</span>
              <input
                type="checkbox"
                checked={ghostMode}
                onChange={(event) => setGhostMode(event.target.checked)}
              />
            </label>
          </div>
          <p className="settings-save-state">
            {t(
              'This only hides read entries in this client. The server continues to record history.',
            )}
          </p>
          <p className="settings-save-state">
            {t('Include entries hidden from Continue Reading')}
          </p>
          <p className="settings-save-state">
            {t('Do not write new reading history while active')}
          </p>
        </section>

        {hidden.size > 0 ? (
          <section className="settings-section" aria-labelledby="history-hidden">
            <div className="section-heading-row">
              <h2 id="history-hidden">{t('Hidden entries')}</h2>
              <span className="settings-badge">
                {t('{count} hidden', { count: hidden.size })}
              </span>
            </div>
            <div className="settings-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={clearHiddenHistory}
              >
                {t('Restore hidden history')}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
