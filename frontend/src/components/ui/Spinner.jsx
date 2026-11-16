const SIZES = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-2',
};

const TONES = {
  accent: 'border-navy/15 border-t-accent',
  light: 'border-cream/25 border-t-cream',
};

// Single loading indicator for the app. A spinner reads as "working" without
// shifting the layout the way a line of loading text does.
export default function Spinner({ size = 'md', tone = 'accent', label, className = '' }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full ${SIZES[size] || SIZES.md} ${
          TONES[tone] || TONES.accent
        }`}
      />
      {label ? <span className="text-[12.5px] text-muted">{label}</span> : null}
      <span className="sr-only">{label || 'Loading'}</span>
    </span>
  );
}
