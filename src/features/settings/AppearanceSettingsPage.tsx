import { Link } from 'react-router-dom';
import { updateAppPreferences } from '../../core/preferences/appPreferences';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { PageHeader } from '../../shared/PageHeader';

export function AppearanceSettingsPage() {
  const preferences = useAppPreferences();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title="Appearance" subtitle="Theme and application surface">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="theme-heading">
          <div className="section-heading-row">
            <h2 id="theme-heading">Theme</h2>
          </div>
          <div className="settings-choice-grid">
            {(
              [
                ['dark', 'Cinematic dark', 'Navy surfaces with blue-violet accent'],
                ['pure-black', 'Pure black', 'OLED-friendly true black surfaces'],
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

        <section className="settings-section" aria-labelledby="accent-heading">
          <div className="section-heading-row">
            <h2 id="accent-heading">Accent</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>Accent color</dt>
              <dd>
                <span className="settings-swatch" aria-hidden="true" />
                Blue-violet (fixed)
              </dd>
            </div>
            <div>
              <dt>Theme storage</dt>
              <dd>Stored on this device only</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
