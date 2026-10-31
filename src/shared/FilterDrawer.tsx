import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export interface FilterDrawerProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly onClose: () => void;
  readonly triggerRef?: RefObject<HTMLElement | null>;
  readonly children: ReactNode;
}

export function FilterDrawer({
  open,
  title,
  description,
  onClose,
  triggerRef,
  children,
}: FilterDrawerProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = () =>
      [...(panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ) ?? [])].filter((element) => element.getClientRects().length > 0);

    const first = focusable()[0] ?? closeButton.current;
    first?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        triggerRef?.current?.focus({ preventScroll: true });
        return;
      }

      if (event.key !== 'Tab' || !panel.current) {
        return;
      }

      const items = focusable();

      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open, triggerRef]);

  if (!open) {
    return null;
  }

  const close = () => {
    onClose();
    triggerRef?.current?.focus({ preventScroll: true });
  };

  return createPortal(
    <div className="filter-drawer-shell">
      <div className="filter-drawer-backdrop" aria-hidden="true" onClick={close} />
      <div
        ref={panel}
        className="filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? `${titleId}-description` : undefined}
      >
        <header className="filter-drawer-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={`${titleId}-description`}>{description}</p> : null}
          </div>
          <button
            ref={closeButton}
            className="filter-drawer-close"
            type="button"
            aria-label="Close filters"
            onClick={close}
          >
            ✕
          </button>
        </header>
        <div className="filter-drawer-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
