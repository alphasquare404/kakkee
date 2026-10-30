import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import {
  READER_FILTER_CSS,
  resetReaderSettings,
  updateReaderSettings,
  type ReaderDirection,
  type ReaderFilter,
  type ReaderScale,
  type ReaderSettings,
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
                <label htmlFor="reader-mode">Reading mode</label>
              </dt>
              <dd>
                <select
                  id="reader-mode"
                  className="settings-select"
                  value={settings.mode}
                  onChange={(event) =>
                    updateReaderSettings({
                      mode: event.target.value as ReaderSettings['mode'],
                    })
                  }
                >
                  <option value="vertical">Continuous vertical</option>
                  <option value="webtoon">Webtoon</option>
                  <option value="single">Single page</option>
                  <option value="double">Double page</option>
                  <option value="horizontal">Continuous horizontal</option>
                </select>
              </dd>
            </div>
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
              <dt>
                <label htmlFor="reader-offset">First-page offset</label>
              </dt>
              <dd>
                <div className="settings-range">
                  <input
                    id="reader-offset"
                    type="range"
                    min={0}
                    max={200}
                    step={4}
                    value={settings.firstPageOffset}
                    onChange={(event) =>
                      updateReaderSettings({
                        firstPageOffset: Number(event.target.value),
                      })
                    }
                  />
                  <output>{settings.firstPageOffset} px</output>
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
            <div>
              <dt>
                <label htmlFor="reader-filter">Image filter</label>
              </dt>
              <dd>
                <select
                  id="reader-filter"
                  className="settings-select"
                  value={settings.filter}
                  onChange={(event) =>
                    updateReaderSettings({
                      filter: event.target.value as ReaderFilter,
                    })
                  }
                >
                  <option value="original">Original</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="sepia">Sepia</option>
                  <option value="invert">Invert</option>
                  <option value="contrast">High contrast</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-scale">Page scale</label>
              </dt>
              <dd>
                <select
                  id="reader-scale"
                  className="settings-select"
                  value={settings.scale}
                  onChange={(event) =>
                    updateReaderSettings({
                      scale: event.target.value as ReaderScale,
                    })
                  }
                >
                  <option value="fit-width">Fit width</option>
                  <option value="fit-height">Fit height</option>
                  <option value="original">Original size</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>
                <label htmlFor="reader-direction">Reading direction</label>
              </dt>
              <dd>
                <select
                  id="reader-direction"
                  className="settings-select"
                  value={settings.direction}
                  onChange={(event) =>
                    updateReaderSettings({
                      direction: event.target.value as ReaderDirection,
                    })
                  }
                >
                  <option value="ltr">Left to right</option>
                  <option value="rtl">Right to left</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>Keep screen on</dt>
              <dd>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.keepScreenOn}
                    onChange={(event) =>
                      updateReaderSettings({
                        keepScreenOn: event.target.checked,
                      })
                    }
                  />
                  Use Wake Lock while reading
                </label>
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
                '--preview-filter': READER_FILTER_CSS[settings.filter],
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
