import { updateAppPreferences } from '../../core/preferences/appPreferences';
import {
  updateNsfwPreferences,
  useNsfwPreferences,
} from '../../core/preferences/nsfwPreferences';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  'Library settings': 'Pengaturan perpustakaan',
  'Grid density and card size': 'Kepadatan grid dan ukuran kartu',
  'All settings': 'Semua pengaturan',
  'Grid density': 'Kepadatan grid',
  Compact: 'Ringkas',
  'More posters per row': 'Lebih banyak poster per baris',
  Comfortable: 'Nyaman',
  'Larger posters, fewer columns': 'Poster lebih besar, kolom lebih sedikit',
  Cards: 'Kartu',
  'Show unread and download badges':
    'Tampilkan badge belum dibaca dan unduhan',
  Display: 'Tampilan',
  Grid: 'Grid',
  'Poster grid with authenticated thumbnails':
    'Grid poster dengan thumbnail terautentikasi',
  'Search and filters': 'Pencarian dan filter',
  'Server-side search, status filter, categories, sort':
    'Pencarian server, filter status, kategori, urutan',
  Selection: 'Seleksi',
  'Hide NSFW content': 'Sembunyikan konten NSFW',
  'Hide manga labeled NSFW everywhere in the frontend':
    'Sembunyikan manga berlabel NSFW di seluruh frontend',
  'Selection mode with shift-click range selection':
    'Mode seleksi dengan rentang shift-klik',
});

export function LibrarySettingsPage() {
  const preferences = useAppPreferences();
  const nsfw = useNsfwPreferences();
  const { t } = useI18n();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Library settings')}
        subtitle={t('Grid density and card size')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="density-heading">
          <div className="section-heading-row">
            <h2 id="density-heading">{t('Grid density')}</h2>
          </div>
          <div className="settings-choice-grid">
            {(
              [
                ['compact', t('Compact'), t('More posters per row')],
                ['comfortable', t('Comfortable'), t('Larger posters, fewer columns')],
              ] as const
            ).map(([value, label, description]) => (
              <button
                className={`settings-choice${preferences.libraryDensity === value ? ' is-active' : ''}`}
                key={value}
                type="button"
                aria-pressed={preferences.libraryDensity === value}
                onClick={() => updateAppPreferences({ libraryDensity: value })}
              >
                <span className={`settings-library-preview is-${value}`} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="library-content-heading">
          <div className="section-heading-row">
            <h2 id="library-content-heading">{t('Hide NSFW content')}</h2>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <span>{t('Hide NSFW content')}</span>
              <input
                type="checkbox"
                checked={nsfw.hideNsfw}
                onChange={(event) =>
                  updateNsfwPreferences({ hideNsfw: event.target.checked })
                }
              />
            </label>
          </div>
          <p className="settings-save-state">
            {t('Hide manga labeled NSFW everywhere in the frontend')}
          </p>
        </section>

        <section className="settings-section" aria-labelledby="library-cards-heading">
          <div className="section-heading-row">
            <h2 id="library-cards-heading">{t('Cards')}</h2>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <span>{t('Show unread and download badges')}</span>
              <input
                type="checkbox"
                checked={preferences.libraryBadges}
                onChange={(event) =>
                  updateAppPreferences({
                    libraryBadges: event.target.checked,
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="library-info-heading">
          <div className="section-heading-row">
            <h2 id="library-info-heading">{t('Display')}</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>{t('Grid')}</dt>
              <dd>{t('Poster grid with authenticated thumbnails')}</dd>
            </div>
            <div>
              <dt>{t('Search and filters')}</dt>
              <dd>{t('Server-side search, status filter, categories, sort')}</dd>
            </div>
            <div>
              <dt>{t('Selection')}</dt>
              <dd>{t('Selection mode with shift-click range selection')}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
