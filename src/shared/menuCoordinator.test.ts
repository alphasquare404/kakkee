import { describe, expect, it, vi } from 'vitest';
import { claimMenu } from './menuCoordinator';

describe('claimMenu', () => {
  it('closes the previous menu when a new menu opens', () => {
    const first = vi.fn();
    const second = vi.fn();
    const releaseFirst = claimMenu(first);
    const releaseSecond = claimMenu(second);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    releaseFirst();
    releaseSecond();
  });

  it('does not close menus that have already released the slot', () => {
    const first = vi.fn();
    const second = vi.fn();
    const releaseFirst = claimMenu(first);
    releaseFirst();
    const releaseSecond = claimMenu(second);

    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    releaseSecond();
  });
});
