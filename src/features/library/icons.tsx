import type { ReactNode, SVGProps } from 'react';

/**
 * One stroked icon family for the Library screen: 16px grid, 1.5px stroke,
 * round caps and joins. All icons are decorative; callers own the label.
 */
function IconBase({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2 13.5 13.5" />
    </IconBase>
  );
}

export function IconFilter(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M2 3.75h12L9.5 8.5v4.1L6.5 14V8.5L2 3.75Z" />
    </IconBase>
  );
}

export function IconSort(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 12.75V3.25" />
      <path d="M2.75 5.5 5 3.25l2.25 2.25" />
      <path d="M11 3.25v9.5" />
      <path d="M8.75 10.5 11 12.75l2.25-2.25" />
    </IconBase>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="m4.25 4.25 7.5 7.5M11.75 4.25l-7.5 7.5" />
    </IconBase>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="m3.25 8.5 3 3 6.5-7.5" />
    </IconBase>
  );
}


export function IconGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="0.8" />
      <rect x="9.25" y="2.25" width="4.5" height="4.5" rx="0.8" />
      <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="0.8" />
      <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="0.8" />
    </IconBase>
  );
}

export function IconList(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5.5 4h8M5.5 8h8M5.5 12h8" />
      <path d="M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
    </IconBase>
  );
}
