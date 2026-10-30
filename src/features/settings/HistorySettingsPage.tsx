import { Link } from 'react-router-dom';
import { updateHistoryPreferences } from '../../core/preferences/historyPreferences';
import { useHistoryPreferences } from '../../shared/useHistoryPreferences';
import { PageHeader } from '../../shared/PageHeader';

export function HistorySettingsPage() {
  const preferences = useHistoryPreferences();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title="History settings" subtitle="Reading history display">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="history-display">
          <div className="section-heading-row">
            <h2 id="history-display">Display</h2>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle">
              <span>Hide read entries</span>
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
            This only hides read entries in this client. The server continues to
            record history.
          </p>
        </section>
      </div>
    </div>
  );
}
