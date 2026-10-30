import { describe, expect, it, vi } from 'vitest';
import { createLoadableController } from './loadableController';

describe('LoadableController', () => {
  it('loads data and preserves it while refreshing', async () => {
    let resolve!: (value: string) => void;
    const load = vi.fn(
      () =>
        new Promise<string>((next) => {
          resolve = next;
        }),
    );
    const controller = createLoadableController({ load });

    const pending = controller.load();
    expect(controller.getState()).toMatchObject({ data: null, isLoading: true });
    resolve('value');
    await pending;

    expect(controller.getState()).toMatchObject({ data: 'value', isLoading: false });
  });

  it('stores errors and keeps previously loaded data', async () => {
    let attempt = 0;
    const controller = createLoadableController({
      load: async () => {
        attempt += 1;
        if (attempt === 1) {
          return 'first';
        }
        throw new Error('failed');
      },
    });

    await controller.load();
    await controller.load();

    expect(controller.getState().data).toBe('first');
    expect(controller.getState().error).toBeInstanceOf(Error);
    expect(controller.getState().isLoading).toBe(false);
  });

  it('ignores stale completions after a newer load starts', async () => {
    const resolvers: Array<(value: string) => void> = [];
    const controller = createLoadableController({
      load: () =>
        new Promise<string>((resolve) => {
          resolvers.push(resolve);
        }),
    });

    const first = controller.load();
    const second = controller.load();
    resolvers[1]?.('new');
    await second;
    resolvers[0]?.('old');
    await first;

    expect(controller.getState().data).toBe('new');
  });
});
