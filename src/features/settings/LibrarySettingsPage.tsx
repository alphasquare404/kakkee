import { Link } from 'react-router-dom';
import { updateAppPreferences } from '../../core/preferences/appPreferences';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { PageHeader } from '../../shared/PageHeader';

export function LibrarySettingsPage() {
  const preferences = useAppPreferences();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title="Library settings" subtitle="Grid density and card size">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="density-heading">
          <div className="section-heading-row">
            <h2 id="density-heading">Grid density</h2>
          </div>
          <div className="settings-choice-grid">
            {(
              [
                ['compact', 'Compact', 'More posters per row'],
                ['comfortable', 'Comfortable', 'Larger posters, fewer columns'],
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

        <section className="settings-section" aria-labelledby="library-cards-heading">
          <div className="section-heading-row">
            <h2 id="library-cards-heading">Cards</h2>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <span>Show unread and download badges</span>
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
            <label className="settings-toggle">
              <span>Show continue-reading progress and shortcut</span>
              <input
                type="checkbox"
                checked={preferences.libraryContinue}
                onChange={(event) =>
                  updateAppPreferences({
                    libraryContinue: event.target.checked,
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="library-info-heading">
          <div className="section-heading-row">
            <h2 id="library-info-heading">Display</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>Grid</dt>
              <dd>Poster grid with authenticated thumbnails</dd>
            </div>
            <div>
              <dt>Search and filters</dt>
              <dd>Server-side search, status filter, categories, sort</dd>
            </div>
            <div>
              <dt>Selection</dt>
              <dd>Selection mode with shift-click range selection</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
