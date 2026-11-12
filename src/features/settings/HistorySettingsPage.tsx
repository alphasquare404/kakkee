import { updateHistoryPreferences } from '../../core/preferences/historyPreferences';
import { useHistoryPreferences } from '../../shared/useHistoryPreferences';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  'History settings': 'Pengaturan riwayat',
  'Reading history display': 'Tampilan riwayat bacaan',
  'All settings': 'Semua pengaturan',
  Display: 'Tampilan',
  'Hide read entries': 'Sembunyikan entri yang sudah dibaca',
  'This only hides read entries in this client. The server continues to record history.':
    'Ini hanya menyembunyikan entri yang dibaca di klien ini. Server tetap mencatat riwayat.',
});

export function HistorySettingsPage() {
  const preferences = useHistoryPreferences();
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
          </div>
          <p className="settings-save-state">
            {t(
              'This only hides read entries in this client. The server continues to record history.',
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
