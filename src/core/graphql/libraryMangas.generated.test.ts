import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { LibraryMangasDocument } from './generated/graphql';

describe('LibraryMangasDocument', () => {
  it('is a generated Library query with library-scoped forward pagination', () => {
    const source = print(LibraryMangasDocument);

    expect(LibraryMangasDocument.kind).toBe('Document');
    expect(LibraryMangasDocument.definitions).toHaveLength(1);
    expect(LibraryMangasDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'LibraryMangas' },
    });
    expect(source).toContain('condition: { inLibrary: true }');
    expect(source).toContain('after: $after');
    expect(source).toContain('pageInfo');
    expect(source).toContain('totalCount');
    expect(source).not.toContain('preview');
  });
});
