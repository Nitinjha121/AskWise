interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/** Material Symbols glyph. Decorative: pair it with visible text or an aria-label. */
export function Icon({ name, className = "", filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined leading-none select-none ${filled ? "[font-variation-settings:'FILL'_1]" : ""} ${className}`}
    >
      {name}
    </span>
  );
}
