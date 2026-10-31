import { describe, expect, it, vi } from 'vitest';
import { createMangaNoteController } from './mangaNoteController';
import type { MangaNoteRepository } from './mangaNoteRepository';

function setup() {
  const getNote = vi.fn(async () => 'Hello');
  const save = vi.fn(async (_mangaId: number, value: string) => value);
  const remove = vi.fn(async () => undefined);
  const repository = { getNote, save, remove } as unknown as MangaNoteRepository;
  return {
    controller: createMangaNoteController(repository),
    save,
    remove,
  };
}

describe('createMangaNoteController', () => {
  it('loads, saves, and clears a note', async () => {
    const { controller, save, remove } = setup();
    await controller.load(1);
    await controller.save(1, 'Saved');
    await controller.remove(1);

    expect(save).toHaveBeenCalledWith(1, 'Saved');
    expect(remove).toHaveBeenCalledWith(1);
    expect(controller.getState().value).toBe('');
  });
});
