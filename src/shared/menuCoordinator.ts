export type MenuCloser = () => void;

interface ActiveMenu {
  readonly id: symbol;
  readonly close: MenuCloser;
}

let activeMenu: ActiveMenu | null = null;

/**
 * Claims the single app-wide menu slot. Opening a new menu closes the previous
 * disclosure, popover, or context menu before the new one is shown.
 */
export function claimMenu(close: MenuCloser): () => void {
  if (activeMenu && activeMenu.close !== close) {
    const previous = activeMenu;
    activeMenu = null;
    previous.close();
  }

  const id = Symbol('menu');
  activeMenu = { id, close };

  return () => {
    if (activeMenu?.id === id) {
      activeMenu = null;
    }
  };
}
