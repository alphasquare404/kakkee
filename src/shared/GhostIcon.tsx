export function GhostIcon({ size = 18 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 16.8V8.7a5 5 0 0 1 10 0v8.1l-2.5-1.5L10 16.8l-2.5-1.5L5 16.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
      <circle cx="8.2" cy="9.2" r="0.8" fill="currentColor" />
      <circle cx="11.8" cy="9.2" r="0.8" fill="currentColor" />
    </svg>
  );
}
