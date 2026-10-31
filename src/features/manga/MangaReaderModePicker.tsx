import { setMangaReaderMode } from '../../core/preferences/mangaReaderOverrides';
import type { ReaderMode } from '../../core/preferences/readerSettings';
import { useMangaReaderMode } from '../../shared/useMangaReaderMode';

const MODES: ReadonlyArray<{ value: ReaderMode; label: string }> = [
  { value: 'vertical', label: 'Continuous vertical' },
  { value: 'webtoon', label: 'Webtoon' },
  { value: 'single', label: 'Single page' },
  { value: 'double', label: 'Double page' },
  { value: 'horizontal', label: 'Continuous horizontal' },
];

export function MangaReaderModePicker({ mangaId }: { readonly mangaId: number }) {
  const override = useMangaReaderMode(mangaId);

  return (
    <section className="manga-reader-override" aria-labelledby="manga-reader-heading">
      <div className="section-heading-row">
        <h2 id="manga-reader-heading">Reader mode for this manga</h2>
      </div>
      <label className="settings-select-field">
        <span>Mode</span>
        <select
          value={override ?? ''}
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
    </section>
  );
}
