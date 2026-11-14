import { updateAppPreferences } from '../../core/preferences/appPreferences';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { PageHeader } from '../../shared/PageHeader';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  'Cinematic dark': 'Gelap sinematik',
  'Navy surfaces with red accent':
    'Permukaan navy dengan aksen merah',
  'Pure black': 'Hitam pekat',
  'Snow white': 'Putih salju',
  'Clean white surfaces with dark text': 'Permukaan putih bersih dengan teks gelap',
  'OLED-friendly true black surfaces':
    'Permukaan hitam sejati ramah OLED',
  Accent: 'Aksen',
  'Accent color': 'Warna aksen',
  Reset: 'Reset',
  'Theme storage': 'Penyimpanan tema',
  'Stored on this device only': 'Hanya disimpan di perangkat ini',
  English: 'English',
  'Bahasa Indonesia': 'Bahasa Indonesia',
});

export function AppearanceSettingsPage() {
  const preferences = useAppPreferences();
  const { t } = useI18n();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title={t('appearance.title')} subtitle={t('appearance.subtitle')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="theme-heading">
          <div className="section-heading-row">
            <h2 id="theme-heading">{t('appearance.theme')}</h2>
          </div>
          <div className="settings-choice-grid">
            {(
              [
                ['dark', t('Cinematic dark'), t('Navy surfaces with blue-violet accent')],
                ['pure-black', t('Pure black'), t('OLED-friendly true black surfaces')],
                ['snow-white', t('Snow white'), t('Clean white surfaces with dark text')],
              ] as const
            ).map(([value, label, description]) => (
              <button
                className={`settings-choice${preferences.theme === value ? ' is-active' : ''}`}
                key={value}
                type="button"
                aria-pressed={preferences.theme === value}
                onClick={() => updateAppPreferences({ theme: value })}
              >
                <span className={`settings-choice-preview is-${value}`} aria-hidden="true" />
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="language-heading">
          <div className="section-heading-row">
            <h2 id="language-heading">{t('appearance.language')}</h2>
          </div>
          <label className="settings-select-field">
            <span>{t('appearance.language')}</span>
            <select
              value={preferences.locale}
              onChange={(event) =>
                updateAppPreferences({
                  locale: event.target.value as 'en' | 'id',
                })
              }
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </label>
          <p className="settings-save-state">{t('appearance.languageHint')}</p>
        </section>

        <section className="settings-section" aria-labelledby="accent-heading">
          <div className="section-heading-row">
            <h2 id="accent-heading">{t('Accent')}</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>{t('Accent color')}</dt>
              <dd className="settings-accent-editor">
                <input
                  type="color"
                  aria-label={t('Accent color')}
                  value={preferences.accent}
                  onChange={(event) =>
                    updateAppPreferences({ accent: event.target.value })
                  }
                />
                <code>{preferences.accent}</code>
                <button
                  className="library-action"
                  type="button"
                  onClick={() =>
                    updateAppPreferences({ accent: '#f3332a' })
                  }
                >
                  {t('Reset')}
                </button>
              </dd>
            </div>
            <div>
              <dt>{t('Theme storage')}</dt>
              <dd>{t('Stored on this device only')}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
