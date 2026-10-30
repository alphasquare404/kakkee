export interface AmbientArtProps {
  readonly imageUrl: string | null;
  readonly className?: string;
}

/**
 * Decorative blurred artwork layer. The image is already an object URL owned
 * by useImageResource; this component never fetches or authenticates anything.
 */
export function AmbientArt({ imageUrl, className = '' }: AmbientArtProps) {
  return (
    <div
      className={`ambient-art${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
    />
  );
}
