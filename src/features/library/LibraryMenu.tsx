import { useEffect, useRef, type KeyboardEvent } from 'react';
import { IconCheck } from './icons';

export interface LibraryMenuOption {
  readonly value: string;
  readonly label: string;
}

export interface LibraryMenuGroup {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly LibraryMenuOption[];
  readonly onSelect: (value: string) => void;
}

export interface LibraryMenuProps {
  readonly id: string;
  readonly label: string;
  readonly open: boolean;
  readonly groups: readonly LibraryMenuGroup[];
  readonly onClose: () => void;
}

function menuItems(root: HTMLDivElement | null): HTMLButtonElement[] {
  if (!root) {
    return [];
  }

  return Array.from(root.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
}

/**
 * Disclosure menu for Library refinements. The panel keeps a single tab stop
 * and is closed (not just hidden) from the tab order while collapsed.
 */
export function LibraryMenu({ id, label, open, groups, onClose }: LibraryMenuProps) {
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const items = menuItems(menu.current);
    const checked = items.find((item) => item.getAttribute('aria-checked') === 'true');

    (checked ?? items[0])?.focus();
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      onClose();
      return;
    }

    const items = menuItems(menu.current);

    if (items.length === 0) {
      return;
    }

    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;

    switch (event.key) {
      case 'ArrowDown':
        next = current < 0 ? 0 : (current + 1) % items.length;
        break;
      case 'ArrowUp':
        next = current <= 0 ? items.length - 1 : current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    items[next]?.focus();
  };

  return (
    <div
      className="library-menu"
      id={id}
      role="menu"
      aria-label={label}
      hidden={!open}
      ref={menu}
      onKeyDown={handleKeyDown}
    >
      {groups.map((group) => (
        <div className="library-menu-group" key={group.key} role="group" aria-label={group.label}>
          <p className="library-menu-label" aria-hidden="true">
            {group.label}
          </p>

          {group.options.map((option) => {
            const checked = option.value === group.value;

            return (
              <button
                className={`library-menu-item${checked ? ' is-checked' : ''}`}
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => group.onSelect(option.value)}
              >
                <span>{option.label}</span>
                {checked ? <IconCheck className="library-menu-check" /> : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
