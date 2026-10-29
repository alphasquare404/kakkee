// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ConnectionProvider } from './ConnectionProvider';
import { useConnection } from './useConnection';
import { FakeConnectionCoordinator, makeConnectedState } from '../test/fakeConnectionCoordinator';

function Probe() {
  const { state } = useConnection();

  return <span data-testid="status">{state.status}</span>;
}

function wrapper(children: ReactNode, createCoordinator: () => FakeConnectionCoordinator) {
  return (
    <ConnectionProvider createCoordinator={createCoordinator}>{children}</ConnectionProvider>
  );
}

afterEach(() => {
  cleanup();
});

describe('ConnectionProvider', () => {
  it('creates the coordinator once and does not recreate it on rerender', () => {
    const coordinator = new FakeConnectionCoordinator();
    const createCoordinator = vi.fn(() => coordinator);
    const { rerender } = render(wrapper(<Probe />, createCoordinator));

    expect(createCoordinator).toHaveBeenCalledTimes(1);
    rerender(wrapper(<Probe />, createCoordinator));
    expect(createCoordinator).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status').textContent).toBe('disconnected');
  });

  it('subscribes to coordinator state and cleans up on unmount', async () => {
    const coordinator = new FakeConnectionCoordinator();
    const { unmount } = render(wrapper(<Probe />, () => coordinator));

    expect(coordinator.listenerCount).toBe(1);

    act(() => {
      coordinator.emit(makeConnectedState());
    });
    expect(screen.getByTestId('status').textContent).toBe('connected');

    unmount();
    expect(coordinator.listenerCount).toBe(0);
    await waitFor(() => expect(coordinator.disposed).toBe(true));
  });
});
