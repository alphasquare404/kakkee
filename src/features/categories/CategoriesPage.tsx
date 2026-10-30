import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createCatalogRepository,
  type CatalogCategory,
} from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { PageHeader } from '../../shared/PageHeader';

export function CategoriesPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <CategoriesContent context={state.context} />;
}

function CategoryCard({ category }: { readonly category: CatalogCategory }) {
  return (
    <article className="category-card">
      <span className="category-mark" aria-hidden="true">
        {category.name.trim().charAt(0).toUpperCase() || 'C'}
      </span>
      <div className="category-copy">
        <h2>{category.name}</h2>
        <p>
          {category.mangas.totalCount.toLocaleString('en-US')} manga
          {category.default || category.isDefaultCategory ? ' · Default' : ''}
        </p>
      </div>
    </article>
  );
}

function CategoriesContent({ context }: { readonly context: ConnectedContext }) {
  const repository = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createLoadableController({ load: () => repository.getCategories() }),
    [repository],
  );
  const categories = useSyncExternalStore(controller.subscribe, controller.getState);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const items = categories.data ?? [];

  return (
    <div className="app-shell page-shell categories-shell">
      <PageHeader
        title="Categories"
        subtitle="Organize your library"
        count={categories.data ? `${items.length} categories` : undefined}
      />

      {categories.isLoading && !categories.data ? (
        <div className="category-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="category-card category-card-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {categories.error && !categories.data ? (
        <div className="library-state" role="alert">
          <h1>Couldn&apos;t load categories</h1>
          <p>The categories could not be loaded from your server.</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!categories.isLoading && !categories.error && items.length === 0 ? (
        <div className="library-state">
          <h1>No categories</h1>
          <p>Create categories in Suwayomi Server to organize your library.</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="category-grid">
          {items.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
