import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { LibraryCategoriesDocument } from './generated/graphql';

describe('LibraryCategoriesDocument', () => {
  it('is a generated category navigation query ordered by backend order', () => {
    const source = print(LibraryCategoriesDocument);

    expect(LibraryCategoriesDocument.kind).toBe('Document');
    expect(LibraryCategoriesDocument.definitions).toHaveLength(1);
    expect(LibraryCategoriesDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'LibraryCategories' },
    });
    expect(source).toContain('order: [{ by: ORDER, byType: ASC }]');
    expect(source).toContain('id');
    expect(source).toContain('name');
    expect(source).toContain('order');
    expect(source).toContain('mangas');
    expect(source).toContain('totalCount');
    expect(source).not.toContain('preview');
  });
});
