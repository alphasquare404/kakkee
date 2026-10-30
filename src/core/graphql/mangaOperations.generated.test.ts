import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  FetchChapterPagesDocument,
  MangaDetailDocument,
  ReaderChapterDocument,
  ReaderNeighborsDocument,
} from './generated/graphql';

describe('manga and reader generated documents', () => {
  it('exposes stable manga detail and chapter pagination', () => {
    const source = print(MangaDetailDocument);

    expect(source).toContain('manga(id: $mangaId)');
    expect(source).toContain('chapters(');
    expect(source).toContain('condition: { mangaId: $mangaId }');
    expect(source).toContain('order: $order');
    expect(source).not.toContain('preview');
  });

  it('exposes reader chapter, neighbors, and page path operation', () => {
    expect(print(ReaderChapterDocument)).toContain('chapter(id: $chapterId)');
    expect(print(ReaderNeighborsDocument)).toContain('previous: chapters(');
    expect(print(ReaderNeighborsDocument)).toContain('next: chapters(');
    expect(print(FetchChapterPagesDocument)).toContain('fetchChapterPages');
    expect(print(FetchChapterPagesDocument)).toContain('pages');
  });
});
