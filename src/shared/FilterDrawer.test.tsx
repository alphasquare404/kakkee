// @vitest-environment jsdom

import { useRef, useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { FilterDrawer } from './FilterDrawer';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function Harness() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={trigger} type="button" onClick={() => setOpen(true)}>
        Open filters
      </button>
      <FilterDrawer
        open={open}
        title="Source filters"
        description="Comick"
        triggerRef={trigger}
        onClose={() => setOpen(false)}
      >
        <label>
          Language
          <input />
        </label>
      </FilterDrawer>
    </>
  );
}

describe('FilterDrawer', () => {
  it('opens as a modal, locks the page, and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Open filters' });
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Source filters' })).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByLabelText('Language')).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes from the close button', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Open filters' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close filters' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
