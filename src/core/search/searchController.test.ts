import { describe, expect, it, vi } from 'vitest';
import { createSearchController } from './searchController';
import type { SearchRepository } from './searchRepository';

function setup() {
  const search = vi.fn(async () => ({
    mangas: { totalCount: 1, nodes: [] },
    sources: { totalCount: 0, nodes: [] },
  }));
  const repository = { search } as unknown as SearchRepository;
  return { controller: createSearchController(repository), search };
}

describe('createSearchController', () => {
  it('searches and ignores empty queries', async () => {
    const { controller, search } = setup();
    await controller.search('  alpha  ');

    expect(controller.getState().status).toBe('ready');
    expect(search).toHaveBeenCalledWith('alpha');

    await controller.search('   ');
    expect(controller.getState().status).toBe('idle');
  });
});
