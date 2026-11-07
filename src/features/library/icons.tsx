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

export function IconExtensions(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M7.5 4.2a2 2 0 0 1 3.8-.7c.2.4.1.9.4 1.2.3.3.7.1 1.1.1h1.5a1.6 1.6 0 0 1 1.6 1.6v2.1c0 .4-.2.8-.5 1-.4.3-.9.1-1.3.4a2 2 0 0 0 0 3.2c.4.3.9.1 1.3.4.3.2.5.6.5 1v1.6a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 16.2v-2.1c0-.4.2-.8.5-1 .4-.3.9-.1 1.3-.4a2 2 0 0 0 0-3.2c-.4-.3-.9-.1-1.3-.4a1.4 1.4 0 0 1-.5-1V6.4a1.6 1.6 0 0 1 1.6-1.6h1.5c.4 0 .8.2 1-.1.3-.3.2-.8.4-1.2Z" />
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

export function IconPin(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 2.5h6v11l-3-2-3 2v-11Z" />
    </IconBase>
  );
}

export function IconArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M13 8H3" />
      <path d="m7 4-4 4 4 4" />
    </IconBase>
  );
}

export function IconChevron(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="m4.25 6 3.75 4 3.75-4" />
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


export function IconSync(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 8a5 5 0 0 1 8.5-3.5L13 6" />
      <path d="M13 3v3h-3" />
      <path d="M13 8a5 5 0 0 1-8.5 3.5L3 10" />
      <path d="M3 13v-3h3" />
    </IconBase>
  );
}

export function IconDownload(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M8 2.5v7.5" />
      <path d="m5 7 3 3 3-3" />
      <path d="M3.5 12.5v.8c0 .4.3.7.7.7h7.6c.4 0 .7-.3.7-.7v-.8" />
    </IconBase>
  );
}

export function IconInfo(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 7.2v3.5" />
      <circle cx="8" cy="4.9" r="0.45" fill="currentColor" stroke="none" />
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
