import {
  setMangaReaderOverride,
  updateMangaReaderOverride,
} from '../../core/preferences/mangaReaderOverrides';
import type {
  ReaderDirection,
  ReaderFilter,
  ReaderMode,
  ReaderScale,
} from '../../core/preferences/readerSettings';
import { useMangaReaderOverride } from '../../shared/useMangaReaderOverride';
import { useReaderSettings } from '../../shared/useReaderSettings';

const MODES: ReadonlyArray<{ value: ReaderMode; label: string }> = [
  { value: 'vertical', label: 'Continuous vertical' },
  { value: 'webtoon', label: 'Webtoon' },
  { value: 'single', label: 'Single page' },
  { value: 'double', label: 'Double page' },
  { value: 'horizontal', label: 'Continuous horizontal' },
];

export function MangaReaderModePicker({ mangaId }: { readonly mangaId: number }) {
  const global = useReaderSettings();
  const override = useMangaReaderOverride(mangaId);
  const enabled = override !== null;

  return (
    <section className="manga-reader-override" aria-labelledby="manga-reader-heading">
      <div className="section-heading-row">
        <h2 id="manga-reader-heading">Reader</h2>
      </div>

      <label className="settings-toggle">
        <span>Use Custom Reader</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            if (!event.target.checked) {
              setMangaReaderOverride(mangaId, null);
              return;
            }

            setMangaReaderOverride(mangaId, {
              mode: global.mode,
              widthRem: global.widthRem,
              gapPx: global.gapPx,
              background: global.background,
              filter: global.filter,
              scale: global.scale,
              direction: global.direction,
            });
          }}
        />
      </label>

      {enabled ? (
        <>
          <div className="manga-reader-grid">
            <label className="settings-select-field">
              <span>Mode</span>
              <select
                value={override.mode ?? global.mode}
                onChange={(event) =>
                  updateMangaReaderOverride(mangaId, {
                    mode: event.target.value as ReaderMode,
                  })
                }
              >
                {MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="settings-text-field">
              <span>Width (rem)</span>
              <input
                type="number"
                min={42}
                max={100}
                value={override.widthRem ?? global.widthRem}
                onChange={(event) =>
                  updateMangaReaderOverride(mangaId, {
                    widthRem: Number(event.target.value),
                  })
                }
              />
            </label>

            <label className="settings-select-field">
              <span>Image filter</span>
              <select
                value={override.filter ?? global.filter}
                onChange={(event) =>
                  updateMangaReaderOverride(mangaId, {
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
            </label>

            <label className="settings-select-field">
              <span>Page scale</span>
              <select
                value={override.scale ?? global.scale}
                onChange={(event) =>
                  updateMangaReaderOverride(mangaId, {
                    scale: event.target.value as ReaderScale,
                  })
                }
              >
                <option value="fit-width">Fit width</option>
                <option value="fit-height">Fit height</option>
                <option value="screen">Fit screen</option>
                <option value="original">Original size</option>
              </select>
            </label>

            <label className="settings-select-field">
              <span>Direction</span>
              <select
                value={override.direction ?? global.direction}
                onChange={(event) =>
                  updateMangaReaderOverride(mangaId, {
                    direction: event.target.value as ReaderDirection,
                  })
                }
              >
                <option value="ltr">Left to right</option>
                <option value="rtl">Right to left</option>
              </select>
            </label>

            <label className="settings-select-field">
              <span>Background</span>
              <input
                type="color"
                aria-label="Manga background color"
                value={override.background ?? global.background}
                onChange={(event) =>
                  updateMangaReaderOverride(mangaId, {
                    background: event.target.value,
                  })
                }
              />
            </label>
          </div>
          <p className="settings-save-state">
            Changes apply only to this manga.
          </p>
        </>
      ) : (
        <p className="settings-save-state">
          This manga uses the global Reader settings.
        </p>
      )}
    </section>
  );
}
