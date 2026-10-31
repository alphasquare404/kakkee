import { useEffect, useMemo, useState } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createMangaCategoryRepository,
  type MangaCategory,
} from '../../core/manga/mangaCategoryRepository';

export function MangaCategoryPicker({
  context,
  mangaId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
}) {
  const repository = useMemo(
    () => createMangaCategoryRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const [all, setAll] = useState<readonly MangaCategory[]>([]);
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;

    void repository
      .get(mangaId)
      .then((result) => {
        if (!active) {
          return;
        }

        setAll(result.all);
        setSelected(new Set(result.selected.map((category) => category.id)));
        setStatus('ready');
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [mangaId, repository]);

  return (
    <section className="manga-categories" aria-labelledby="manga-categories-heading">
      <div className="section-heading-row">
        <h2 id="manga-categories-heading">Categories</h2>
        <span>{selected.size} selected</span>
      </div>

      {status === 'loading' ? (
        <p className="settings-save-state" role="status">
          Loading categories…
        </p>
      ) : null}

      {status === 'error' ? (
        <p className="settings-inline-error" role="alert">
          Categories could not be loaded.
        </p>
      ) : null}

      {status === 'ready' && all.length === 0 ? (
        <p className="settings-save-state">No categories yet.</p>
      ) : null}

      {status === 'ready' && all.length > 0 ? (
        <>
          <div className="manga-category-list">
            {all.map((category) => {
              const checked = selected.has(category.id);

              return (
                <label className="settings-inline-toggle" key={category.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={saving}
                    onChange={() => {
                      setSelected((current) => {
                        const next = new Set(current);

                        if (checked) {
                          next.delete(category.id);
                        } else {
                          next.add(category.id);
                        }

                        return next;
                      });
                    }}
                  />
                  {category.name}
                </label>
              );
            })}
          </div>
          <div className="settings-actions">
            <button
              className="button"
              type="button"
              disabled={saving}
              onClick={() => {
                setSaveError(false);
                setSaving(true);
                void repository
                  .save(mangaId, [...selected])
                  .catch(() => setSaveError(true))
                  .finally(() => setSaving(false));
              }}
            >
              {saving ? 'Saving…' : 'Save categories'}
            </button>
          </div>
        </>
      ) : null}

      {saveError ? (
        <p className="settings-inline-error" role="alert">
          Categories could not be saved.
        </p>
      ) : null}
    </section>
  );
}
