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
  'Remove from library': 'Hapus dari perpustakaan',
  Save: 'Simpan',
  'Saving…': 'Menyimpan…',
});

export function MangaBookmarkChoices({
  context,
  mangaId,
  onSetLibrary,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
  readonly onSetLibrary: (inLibrary: boolean) => Promise<void>;
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

  const save = async () => {
    setSaveError(false);
    setSaving(true);

    try {
      await onSetLibrary(selected.size > 0);

      if (selected.size > 0) {
        await repository.save(mangaId, [...selected]);
      }
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (categoryId: number) => {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
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
            void onSetLibrary(true)
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
              <label className="bookmark-category-option" key={category.id}>
                <input
                  type="checkbox"
                  checked={active}
                  disabled={saving}
                  onChange={() => toggle(category.id)}
                />
                <span>{category.name}</span>
              </label>
            );
          })}
        </div>
      )}

      <button
        className="button"
        type="button"
        disabled={saving}
        onClick={() => void save()}
      >
        {saving
          ? t('Saving…')
          : selected.size > 0
            ? t('Save')
            : t('Remove from library')}
      </button>

      {saveError ? (
        <p className="settings-inline-error" role="alert">
          {t('Categories could not be saved.')}
        </p>
      ) : null}
    </>
  );
}
