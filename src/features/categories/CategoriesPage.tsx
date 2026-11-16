import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createCategoryController,
} from '../../core/categories/categoryController';
import {
  createCategoryRepository,
  type Category,
} from '../../core/categories/categoryRepository';
import { PageHeader } from '../../shared/PageHeader';
import { BackButton } from '../../shared/BackButton';
import { ActionMenu } from '../../shared/ActionMenu';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Categories: 'Kategori',
  'Organize your library': 'Atur perpustakaan Anda',
  '{count} categories': '{count} kategori',
  'New category': 'Kategori baru',
  'Category name': 'Nama kategori',
  Create: 'Buat',
  Cancel: 'Batal',
  'The last category change was rejected by the server.':
    'Perubahan kategori terakhir ditolak server.',
  'Couldn’t load categories': 'Tidak dapat memuat kategori',
  'The categories could not be loaded from your server.':
    'Kategori tidak dapat dimuat dari server Anda.',
  Retry: 'Coba lagi',
  'No categories': 'Belum ada kategori',
  'Create a category to organize your library.':
    'Buat kategori untuk mengatur perpustakaan Anda.',
  Save: 'Simpan',
  '{count} manga': '{count} manga',
  'Default': 'Default',
  'Include in updates': 'Sertakan dalam update',
  'Include in downloads': 'Sertakan dalam unduhan',
  'Delete this category?': 'Hapus kategori ini?',
  Confirm: 'Konfirmasi',
  Rename: 'Ubah nama',
  More: 'Lainnya',
  'More actions for': 'Aksi lainnya untuk',
  'Move up': 'Naikkan',
  'Move down': 'Turunkan',
  'Set default': 'Jadikan default',
  Delete: 'Hapus',
  Back: 'Kembali',
});

export function CategoriesPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <CategoriesContent context={state.context} />;
}

function CategoriesContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const controller = useMemo(() => {
    const repository = createCategoryRepository({
      getClient: () => context.graphQL,
    });

    return createCategoryController(repository);
  }, [context.graphQL]);
  const categories = useSyncExternalStore(controller.subscribe, controller.getState);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const items = categories.items;

  const createCategory = async () => {
    const name = newName.trim();

    if (!name) {
      return;
    }

    if (await controller.create(name)) {
      setNewName('');
      setCreating(false);
    }
  };

  const saveRename = async (category: Category) => {
    const name = renameValue.trim();

    if (!name || name === category.name) {
      setRenamingId(null);
      return;
    }

    if (await controller.rename(category.id, name)) {
      setRenamingId(null);
    }
  };

  const moveCategory = (category: Category, direction: -1 | 1) => {
    const currentIndex = items.findIndex((item) => item.id === category.id);
    const target = items[currentIndex + direction];

    if (!target) {
      return;
    }

    void controller.move(category.id, target.order);
  };

  return (
    <div className="app-shell page-shell categories-shell">
      <PageHeader
        title={t('Categories')}
        subtitle={t('Organize your library')}
        leading={<BackButton to="/settings" label={t('Back')} />}
        count={
          categories.status === 'ready'
            ? t('{count} categories', { count: items.length })
            : undefined
        }
      >
        <button
          className="button"
          type="button"
          onClick={() => setCreating((value) => !value)}
        >
          {t('New category')}
        </button>
      </PageHeader>

      {creating ? (
        <form
          className="category-create"
          onSubmit={(event) => {
            event.preventDefault();
            void createCategory();
          }}
        >
          <label>
            <span className="sr-only">{t('Category name')}</span>
            <input
              autoFocus
              value={newName}
              maxLength={120}
              placeholder={t('Category name')}
              onChange={(event) => setNewName(event.target.value)}
            />
          </label>
          <button
            className="button"
            type="submit"
            disabled={categories.busy || !newName.trim()}
          >
            {t('Create')}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName('');
            }}
          >
            {t('Cancel')}
          </button>
        </form>
      ) : null}

      {categories.actionError ? (
        <p className="settings-inline-error" role="alert">
          {t('The last category change was rejected by the server.')}
        </p>
      ) : null}

      {categories.status === 'loading' && items.length === 0 ? (
        <div className="category-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="category-card category-card-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {categories.status === 'error' && items.length === 0 ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldn’t load categories')}</h1>
          <p>{t('The categories could not be loaded from your server.')}</p>
          <button className="button" type="button" onClick={() => void controller.retry()}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {categories.status === 'ready' && items.length === 0 ? (
        <div className="library-state">
          <h1>{t('No categories')}</h1>
          <p>{t('Create a category to organize your library.')}</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="category-grid">
          {items.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              busy={categories.busy}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
              renaming={renamingId === category.id}
              renameValue={renameValue}
              deleting={deletingId === category.id}
              onStartRename={() => {
                setRenamingId(category.id);
                setRenameValue(category.name);
                setDeletingId(null);
              }}
              onRenameChange={setRenameValue}
              onSaveRename={() => void saveRename(category)}
              onCancelRename={() => setRenamingId(null)}
              onStartDelete={() => {
                setDeletingId(category.id);
                setRenamingId(null);
              }}
              onCancelDelete={() => setDeletingId(null)}
              onConfirmDelete={() => {
                void controller.remove(category.id).then((ok) => {
                  if (ok) {
                    setDeletingId(null);
                  }
                });
              }}
              onMoveUp={() => moveCategory(category, -1)}
              onMoveDown={() => moveCategory(category, 1)}
              onSetDefault={() =>
                void controller.setFlags(category.id, { default: true })
              }
              onToggleUpdate={() =>
                void controller.setFlags(category.id, {
                  includeInUpdate:
                    category.includeInUpdate === 'INCLUDE'
                      ? 'EXCLUDE'
                      : 'INCLUDE',
                })
              }
              onToggleDownload={() =>
                void controller.setFlags(category.id, {
                  includeInDownload:
                    category.includeInDownload === 'INCLUDE'
                      ? 'EXCLUDE'
                      : 'INCLUDE',
                })
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryCard({
  category,
  busy,
  canMoveUp,
  canMoveDown,
  renaming,
  renameValue,
  deleting,
  onStartRename,
  onRenameChange,
  onSaveRename,
  onCancelRename,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
  onMoveUp,
  onMoveDown,
  onSetDefault,
  onToggleUpdate,
  onToggleDownload,
}: {
  readonly category: Category;
  readonly busy: boolean;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly renaming: boolean;
  readonly renameValue: string;
  readonly deleting: boolean;
  readonly onStartRename: () => void;
  readonly onRenameChange: (value: string) => void;
  readonly onSaveRename: () => void;
  readonly onCancelRename: () => void;
  readonly onStartDelete: () => void;
  readonly onCancelDelete: () => void;
  readonly onConfirmDelete: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onSetDefault: () => void;
  readonly onToggleUpdate: () => void;
  readonly onToggleDownload: () => void;
}) {
  const { t } = useI18n();
  const isDefault = category.default || category.isDefaultCategory;

  return (
    <article className="category-card">
      <ActionMenu
        label={<MoreVerticalIcon />}
        ariaLabel={`${t('More actions for')} ${category.name}`}
        showChevron={false}
        className="category-card-menu"
        summaryClassName="category-card-menu-trigger"
      >
        <button disabled={busy} type="button" onClick={onStartRename}>
          {t('Rename')}
        </button>
        <button disabled={busy || !canMoveUp} type="button" onClick={onMoveUp}>
          {t('Move up')}
        </button>
        <button disabled={busy || !canMoveDown} type="button" onClick={onMoveDown}>
          {t('Move down')}
        </button>
        <button disabled={busy || isDefault} type="button" onClick={onSetDefault}>
          {t('Set default')}
        </button>
        <button
          className="is-danger"
          disabled={busy || isDefault}
          type="button"
          onClick={onStartDelete}
        >
          {t('Delete')}
        </button>
      </ActionMenu>
      <span className="category-mark" aria-hidden="true">
        {category.name.trim().charAt(0).toUpperCase() || 'C'}
      </span>
      <div className="category-copy">
        {renaming ? (
          <form
            className="category-rename"
            onSubmit={(event) => {
              event.preventDefault();
              onSaveRename();
            }}
          >
            <input
              autoFocus
              aria-label={`Rename ${category.name}`}
              value={renameValue}
              maxLength={120}
              onChange={(event) => onRenameChange(event.target.value)}
            />
            <button className="button" type="submit" disabled={busy || !renameValue.trim()}>
              {t('Save')}
            </button>
            <button className="button button-secondary" type="button" onClick={onCancelRename}>
              {t('Cancel')}
            </button>
          </form>
        ) : (
          <h2>{category.name}</h2>
        )}
        <p>
          {t('{count} manga', {
            count: category.mangas.totalCount.toLocaleString('en-US'),
          })}
          {isDefault ? ` · ${t('Default')}` : ''}
        </p>
        <div className="category-flags">
          <label className="switch-toggle">
            <span>{t('Include in updates')}</span>
            <span className="switch-control">
              <input
                type="checkbox"
                checked={category.includeInUpdate === 'INCLUDE'}
                disabled={busy}
                onChange={onToggleUpdate}
              />
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
            </span>
          </label>
          <label className="switch-toggle">
            <span>{t('Include in downloads')}</span>
            <span className="switch-control">
              <input
                type="checkbox"
                checked={category.includeInDownload === 'INCLUDE'}
                disabled={busy}
                onChange={onToggleDownload}
              />
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
            </span>
          </label>
        </div>
        {deleting ? (
          <div className="category-delete-confirm" role="alert">
            <span>{t('Delete this category?')}</span>
            <button className="button button-danger" type="button" disabled={busy} onClick={onConfirmDelete}>
              {t('Confirm')}
            </button>
            <button className="button button-secondary" type="button" onClick={onCancelDelete}>
              {t('Cancel')}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}



function MoreVerticalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.45" />
      <circle cx="10" cy="10" r="1.45" />
      <circle cx="10" cy="15.5" r="1.45" />
    </svg>
  );
}
