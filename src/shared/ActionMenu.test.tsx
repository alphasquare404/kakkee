// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ActionMenu } from './ActionMenu';

afterEach(cleanup);

describe('ActionMenu', () => {
  it('opens, closes on an action, and restores focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <ActionMenu label="More" ariaLabel="More actions">
        <button type="button">Refresh</button>
      </ActionMenu>,
    );

    const trigger = screen.getByLabelText('More actions');
    const details = trigger.closest('details');

    await user.click(trigger);
    expect(details?.open).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(details?.open).toBe(false));

    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(details?.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when the pointer goes outside the menu', async () => {
    const user = userEvent.setup();
    render(
      <ActionMenu label="More" ariaLabel="Outside actions">
        <button type="button">Action</button>
      </ActionMenu>,
    );

    const trigger = screen.getByLabelText('Outside actions');
    const details = trigger.closest('details');

    await user.click(trigger);
    expect(details?.open).toBe(true);
    await user.click(document.body);
    expect(details?.open).toBe(false);
  });
});
