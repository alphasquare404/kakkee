import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { claimMenu } from './menuCoordinator';

export interface ActionMenuProps {
  readonly label: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly summaryClassName?: string;
  readonly align?: 'start' | 'end';
  readonly ariaLabel?: string;
  readonly triggerRef?: RefObject<HTMLElement | null>;
}

export function ActionMenu({
  label,
  children,
  className = '',
  summaryClassName = 'button button-secondary',
  align = 'end',
  ariaLabel,
  triggerRef,
}: ActionMenuProps) {
  const details = useRef<HTMLDetailsElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>();


  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const position = () => {
      const summary = details.current?.querySelector('summary');
      const menu = panel.current;

      if (!summary || !menu) {
        return;
      }

      const rect = summary.getBoundingClientRect();
      const width = Math.min(240, window.innerWidth - 24);
      const height = menu.offsetHeight;
      let top = rect.bottom + 8;

      if (top + height > window.innerHeight - 12) {
        top = Math.max(12, rect.top - height - 8);
      }

      let left = align === 'end' ? rect.right - width : rect.left;
      left = Math.max(12, Math.min(left, window.innerWidth - width - 12));

      setPanelStyle({
        position: 'fixed',
        top,
        left,
        right: 'auto',
        width,
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
      });
    };

    position();
    const frame = window.requestAnimationFrame(position);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [align, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    return claimMenu(() => {
      if (details.current?.open) {
        details.current.open = false;
      }
    });
  }, [open]);

  useEffect(() => {
    const node = details.current;

    if (!node) {
      return;
    }

    const close = (restoreFocus: boolean) => {
      if (!node.open) {
        return;
      }

      node.open = false;

      if (restoreFocus) {
        node.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (target && !node.contains(target)) {
        close(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && node.open) {
        event.preventDefault();
        close(true);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const actionable = target?.closest('a,button');

      if (actionable && !actionable.closest('summary') && !actionable.hasAttribute('data-keep-open')) {
        window.setTimeout(() => close(false), 0);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    node.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      node.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <details
      ref={details}
      className={`action-menu action-menu-${align}${className ? ` ${className}` : ''}`}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        ref={triggerRef}
        className={summaryClassName}
        aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      >
        {label}
        <span className="action-menu-chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div ref={panel} className="action-menu-panel" style={panelStyle}>{children}</div>
    </details>
  );
}
