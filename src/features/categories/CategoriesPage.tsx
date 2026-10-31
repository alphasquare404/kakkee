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

export function CategoriesPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <CategoriesContent context={state.context} />;
}

function CategoriesContent({ context }: { readonly context: ConnectedContext }) {
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
        title="Categories"
        subtitle="Organize your library"
        count={categories.status === 'ready' ? `${items.length} categories` : undefined}
      >
        <button
          className="button"
          type="button"
          onClick={() => setCreating((value) => !value)}
        >
          New category
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
            <span className="sr-only">Category name</span>
            <input
              autoFocus
              value={newName}
              maxLength={120}
              placeholder="Category name"
              onChange={(event) => setNewName(event.target.value)}
            />
          </label>
          <button
            className="button"
            type="submit"
            disabled={categories.busy || !newName.trim()}
          >
            Create
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName('');
            }}
          >
            Cancel
          </button>
        </form>
      ) : null}

      {categories.actionError ? (
        <p className="settings-inline-error" role="alert">
          The last category change was rejected by the server.
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
          <h1>Couldn&apos;t load categories</h1>
          <p>The categories could not be loaded from your server.</p>
          <button className="button" type="button" onClick={() => void controller.retry()}>
            Retry
          </button>
        </div>
      ) : null}

      {categories.status === 'ready' && items.length === 0 ? (
        <div className="library-state">
          <h1>No categories</h1>
          <p>Create a category to organize your library.</p>
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
  const isDefault = category.default || category.isDefaultCategory;

  return (
    <article className="category-card">
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
              Save
            </button>
            <button className="button button-secondary" type="button" onClick={onCancelRename}>
              Cancel
            </button>
          </form>
        ) : (
          <h2>{category.name}</h2>
        )}
        <p>
          {category.mangas.totalCount.toLocaleString('en-US')} manga
          {isDefault ? ' · Default' : ''}
        </p>
        <div className="category-flags">
          <label>
            <input
              type="checkbox"
              checked={category.includeInUpdate === 'INCLUDE'}
              disabled={busy}
              onChange={onToggleUpdate}
            />
            Include in updates
          </label>
          <label>
            <input
              type="checkbox"
              checked={category.includeInDownload === 'INCLUDE'}
              disabled={busy}
              onChange={onToggleDownload}
            />
            Include in downloads
          </label>
        </div>
        {deleting ? (
          <div className="category-delete-confirm" role="alert">
            <span>Delete this category?</span>
            <button className="button button-danger" type="button" disabled={busy} onClick={onConfirmDelete}>
              Confirm
            </button>
            <button className="button button-secondary" type="button" onClick={onCancelDelete}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="category-actions">
            <button disabled={busy} type="button" onClick={onStartRename}>
              Rename
            </button>
            <button disabled={busy || !canMoveUp} type="button" onClick={onMoveUp}>
              Move up
            </button>
            <button disabled={busy || !canMoveDown} type="button" onClick={onMoveDown}>
              Move down
            </button>
            <button disabled={busy || isDefault} type="button" onClick={onSetDefault}>
              Set default
            </button>
            <button
              className="is-danger"
              disabled={busy || isDefault}
              type="button"
              onClick={onStartDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
