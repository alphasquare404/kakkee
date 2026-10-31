import {
  setMangaReaderMode,
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

  return (
    <section className="manga-reader-override" aria-labelledby="manga-reader-heading">
      <div className="section-heading-row">
        <h2 id="manga-reader-heading">Reader settings for this manga</h2>
        {override ? (
          <button
            className="library-action"
            type="button"
            onClick={() => setMangaReaderOverride(mangaId, null)}
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="manga-reader-grid">
        <label className="settings-select-field">
          <span>Mode</span>
          <select
            value={override?.mode ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              setMangaReaderMode(
                mangaId,
                value === '' ? null : (value as ReaderMode),
              );
            }}
          >
            <option value="">Use global setting</option>
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
            placeholder={String(global.widthRem)}
            value={override?.widthRem ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              updateMangaReaderOverride(mangaId, {
                widthRem: value === '' ? undefined : Number(value),
              });
            }}
          />
        </label>

        <label className="settings-select-field">
          <span>Image filter</span>
          <select
            value={override?.filter ?? ''}
            onChange={(event) =>
              updateMangaReaderOverride(mangaId, {
                filter:
                  event.target.value === ''
                    ? undefined
                    : (event.target.value as ReaderFilter),
              })
            }
          >
            <option value="">Use global setting</option>
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
            value={override?.scale ?? ''}
            onChange={(event) =>
              updateMangaReaderOverride(mangaId, {
                scale:
                  event.target.value === ''
                    ? undefined
                    : (event.target.value as ReaderScale),
              })
            }
          >
            <option value="">Use global setting</option>
            <option value="fit-width">Fit width</option>
            <option value="fit-height">Fit height</option>
            <option value="screen">Fit screen</option>
            <option value="original">Original size</option>
          </select>
        </label>

        <label className="settings-select-field">
          <span>Direction</span>
          <select
            value={override?.direction ?? ''}
            onChange={(event) =>
              updateMangaReaderOverride(mangaId, {
                direction:
                  event.target.value === ''
                    ? undefined
                    : (event.target.value as ReaderDirection),
              })
            }
          >
            <option value="">Use global setting</option>
            <option value="ltr">Left to right</option>
            <option value="rtl">Right to left</option>
          </select>
        </label>

        <label className="settings-select-field">
          <span>Background</span>
          <input
            type="color"
            aria-label="Manga background color"
            value={override?.background ?? global.background}
            onChange={(event) =>
              updateMangaReaderOverride(mangaId, {
                background: event.target.value,
              })
            }
          />
        </label>
      </div>
      <p className="settings-save-state">
        Empty fields inherit the global Reader settings.
      </p>
    </section>
  );
}
