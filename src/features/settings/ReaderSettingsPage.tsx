import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import {
  resetReaderSettings,
  updateReaderSettings,
} from '../../core/preferences/readerSettings';
import { useReaderSettings } from '../../shared/useReaderSettings';
import { PageHeader } from '../../shared/PageHeader';

const BACKGROUNDS: Array<{ value: string; label: string }> = [
  { value: '#05070c', label: 'Ink' },
  { value: '#000000', label: 'Pure black' },
  { value: '#10151f', label: 'Charcoal' },
];

export function ReaderSettingsPage() {
  const settings = useReaderSettings();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title="Reader settings" subtitle="Defaults for every chapter">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="reader-layout-heading">
          <div className="section-heading-row">
            <h2 id="reader-layout-heading">Layout</h2>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>
                <label htmlFor="reader-width">Reader width</label>
              </dt>
              <dd>
                <div className="settings-range">
                  <input
                    id="reader-width"
                    type="range"
                    min={42}
                    max={100}
                    step={1}
                    value={settings.widthRem}
                    onChange={(event) =>
                      updateReaderSettings({
                        widthRem: Number(event.target.value),
                      })
                    }
                  />
                  <output>{settings.widthRem} rem</output>
                </div>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-gap">Page gap</label>
              </dt>
              <dd>
                <div className="settings-range">
                  <input
                    id="reader-gap"
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={settings.gapPx}
                    onChange={(event) =>
                      updateReaderSettings({ gapPx: Number(event.target.value) })
                    }
                  />
                  <output>{settings.gapPx} px</output>
                </div>
              </dd>
            </div>
            <div>
              <dt>Background</dt>
              <dd>
                <div className="settings-options">
                  {BACKGROUNDS.map((background) => (
                    <button
                      className={
                        settings.background === background.value ? 'is-active' : undefined
                      }
                      key={background.value}
                      type="button"
                      aria-pressed={settings.background === background.value}
                      onClick={() =>
                        updateReaderSettings({ background: background.value })
                      }
                    >
                      <span
                        className="settings-color-dot"
                        style={{ backgroundColor: background.value }}
                        aria-hidden="true"
                      />
                      {background.label}
                    </button>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </section>

        <section className="settings-section" aria-labelledby="reader-preview-heading">
          <div className="section-heading-row">
            <h2 id="reader-preview-heading">Preview</h2>
            <button
              className="library-action"
              type="button"
              onClick={resetReaderSettings}
            >
              Reset defaults
            </button>
          </div>
          <div
            className="reader-settings-preview"
            style={
              {
                '--preview-bg': settings.background,
                '--preview-width': `${settings.widthRem}%`,
                '--preview-gap': `${settings.gapPx}px`,
              } as CSSProperties
            }
          >
            <span>Page 1</span>
            <span>Page 2</span>
            <span>Page 3</span>
          </div>
          <p className="settings-hint">
            These preferences affect the vertical Reader immediately and are
            stored on this device only.
          </p>
        </section>
      </div>
    </div>
  );
}
