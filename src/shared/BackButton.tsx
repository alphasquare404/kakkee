import type { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { registerMessages } from './i18n';

registerMessages('id', {
  Back: 'Kembali',
});

/**
 * Kakkee's contextual back action, following Nuvio Web's back pattern:
 * a minimal Lucide chevron-left in a compact transparent round target with
 * a subtle hover surface and an active scale press.
 *
 * Callers own the destination and any provenance/history behavior; this
 * component only owns the visual action and its accessible name.
 */
export function BackButton({
  to,
  label = 'Back',
  state,
  onClick,
  className = '',
}: {
  readonly to: string;
  readonly label?: string;
  readonly state?: unknown;
  readonly onClick?: MouseEventHandler<HTMLAnchorElement>;
  readonly className?: string;
}) {
  return (
    <Link
      className={`back-button ${className}`.trim()}
      to={to}
      state={state}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </Link>
  );
}
