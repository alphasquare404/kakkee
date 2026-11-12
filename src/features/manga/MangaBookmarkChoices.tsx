import { useEffect, useMemo, useState } from 'react';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createMangaCategoryRepository,
  type MangaCategory,
} from '../../core/manga/mangaCategoryRepository';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Loading categories…': 'Memuat kategori…',
  'No categories yet.': 'Belum ada kategori.',
  'Categories could not be loaded.': 'Kategori tidak dapat dimuat.',
  'Categories could not be saved.': 'Kategori tidak dapat disimpan.',
  'Add to library': 'Tambahkan ke perpustakaan',
  'Saving…': 'Menyimpan…',
});

export function MangaBookmarkChoices({
  context,
  mangaId,
  onEnsureLibrary,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
  readonly onEnsureLibrary: () => Promise<void>;
}) {
  const { t } = useI18n();
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

        const defaults = result.all.filter(
          (category) => category.default || category.isDefaultCategory,
        );
        const initial =
          result.selected.length > 0
            ? result.selected
            : defaults.length > 0
              ? defaults
              : result.all.slice(0, 1);

        setAll(result.all);
        setSelected(new Set(initial.map((category) => category.id)));
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

  const choose = async (categoryId: number) => {
    setSaveError(false);
    setSaving(true);

    try {
      await onEnsureLibrary();
      await repository.save(mangaId, [categoryId]);
      setSelected(new Set([categoryId]));
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <p className="action-menu-section" role="status">
        {t('Loading categories…')}
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="settings-inline-error" role="alert">
        {t('Categories could not be loaded.')}
      </p>
    );
  }

  return (
    <>
      {all.length === 0 ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setSaveError(false);
            setSaving(true);
            void onEnsureLibrary()
              .catch(() => setSaveError(true))
              .finally(() => setSaving(false));
          }}
        >
          {saving ? t('Saving…') : t('Add to library')}
        </button>
      ) : (
        <div className="bookmark-category-list">
          {all.map((category) => {
            const active = selected.has(category.id);

            return (
              <button
                type="button"
                key={category.id}
                className={active ? 'is-active' : undefined}
                aria-pressed={active}
                disabled={saving}
                onClick={() => void choose(category.id)}
              >
                <span>{category.name}</span>
                {active ? <span aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      )}

      {saveError ? (
        <p className="settings-inline-error" role="alert">
          {t('Categories could not be saved.')}
        </p>
      ) : null}
    </>
  );
}
