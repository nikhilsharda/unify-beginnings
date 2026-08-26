const TONES = {
  red: "var(--brand-red)",
  blue: "var(--brand-blue)",
  yellow: "var(--brand-yellow)",
} as const;

/**
 * Layered signature-shape mark used to anchor dark hero sections.
 * Two offset shapes (fill + outline) read as considered, not a single flat blob.
 */
export function BrandGraphic({
  tone = "red",
  className = "",
}: {
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const color = TONES[tone];
  return (
    <div
      className={`pointer-events-none absolute select-none ${className}`}
      aria-hidden
    >
      <div
        className="absolute h-full w-full brand-shape-lg"
        style={{ background: color, opacity: 0.16 }}
      />
      <div
        className="absolute h-[72%] w-[72%] translate-x-[14%] translate-y-[14%] brand-shape-lg"
        style={{ border: `1.5px solid ${color}`, opacity: 0.35 }}
      />
    </div>
  );
}
