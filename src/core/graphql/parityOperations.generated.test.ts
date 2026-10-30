import { describe, expect, it } from 'vitest';
import {
  CategoryCatalogDocument,
  ChapterFeedDocument,
  SourceCatalogDocument,
  UpdateChapterProgressDocument,
} from './generated/graphql';

describe('parity GraphQL operations', () => {
  it('defines the chapter feed operation against supported fields', () => {
    expect(ChapterFeedDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      name: { value: 'ChapterFeed' },
    });
  });

  it('defines source and category catalog reads', () => {
    expect(SourceCatalogDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      name: { value: 'SourceCatalog' },
    });
    expect(CategoryCatalogDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      name: { value: 'CategoryCatalog' },
    });
  });

  it('defines the chapter progress mutation', () => {
    expect(UpdateChapterProgressDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { value: 'UpdateChapterProgress' },
    });
  });
});
