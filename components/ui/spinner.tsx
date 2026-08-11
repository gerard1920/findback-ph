type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  xs: "h-3.5 w-3.5 border-2",
  sm: "h-5 w-5 border-2",
  md: "h-7 w-7 border-[2.5px]",
  lg: "h-9 w-9 border-[2.5px]",
};

export function Spinner({
  size = "sm",
  className = "",
  label,
}: {
  size?: Size;
  className?: string;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2" aria-live="polite" aria-busy="true">
      <span
        aria-hidden="true"
        role="progressbar"
        className={`inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent border-b-transparent text-current ${SIZES[size]} ${className}`}
      />
      {label && <span className="text-sm font-medium text-inherit">{label}</span>}
    </span>
  );
}
