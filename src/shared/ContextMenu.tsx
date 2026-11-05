import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuPosition {
  readonly x: number;
  readonly y: number;
}

export interface ContextMenuProps {
  readonly open: boolean;
  readonly position: ContextMenuPosition;
  readonly label: string;
  readonly onClose: () => void;
  readonly returnFocusRef?: RefObject<HTMLElement | null>;
  readonly children: ReactNode;
}

export function ContextMenu({
  open,
  position,
  label,
  onClose,
  returnFocusRef,
  children,
}: ContextMenuProps) {
  const menu = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState(position);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const node = menu.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const margin = 8;
    setResolved({
      x: Math.max(margin, Math.min(position.x, window.innerWidth - rect.width - margin)),
      y: Math.max(margin, Math.min(position.y, window.innerHeight - rect.height - margin)),
    });
  }, [open, position]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const node = menu.current;
    const items = () =>
      [...(node?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [])];

    items()[0]?.focus({ preventScroll: true });

    const close = () => {
      onClose();
      returnFocusRef?.current?.focus({ preventScroll: true });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !node?.contains(event.target)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      const focusable = items();

      if (focusable.length === 0) {
        return;
      }

      const current = focusable.indexOf(document.activeElement as HTMLElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusable[(current + 1 + focusable.length) % focusable.length]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusable[(current - 1 + focusable.length) % focusable.length]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        focusable[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        focusable[focusable.length - 1]?.focus();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const step = event.shiftKey ? -1 : 1;
        focusable[(current + step + focusable.length) % focusable.length]?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open, returnFocusRef]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      ref={menu}
      className="context-menu"
      role="menu"
      aria-label={label}
      style={{ left: resolved.x, top: resolved.y }}
    >
      {children}
    </div>,
    document.body,
  );
}
