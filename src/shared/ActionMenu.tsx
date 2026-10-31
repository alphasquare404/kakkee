import {
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

export interface ActionMenuProps {
  readonly label: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly summaryClassName?: string;
  readonly align?: 'start' | 'end';
  readonly ariaLabel?: string;
}

export function ActionMenu({
  label,
  children,
  className = '',
  summaryClassName = 'button button-secondary',
  align = 'end',
  ariaLabel,
}: ActionMenuProps) {
  const details = useRef<HTMLDetailsElement>(null);

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
    >
      <summary
        className={summaryClassName}
        aria-label={ariaLabel ?? label}
      >
        {label}
        <span className="action-menu-chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="action-menu-panel">{children}</div>
    </details>
  );
}
