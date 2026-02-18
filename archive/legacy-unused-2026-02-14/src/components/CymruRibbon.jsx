import { cn } from "../lib/cn";

/**
 * CymruRibbon – A reusable two-tone horizontal ribbon motif
 * with gradient transition at the boundary.
 *
 * @param {string} className - Additional classes for the container
 * @param {string} height - Height class (default: "h-[3px]")
 * @param {boolean} spark - Show gold dot at boundary (default: false)
 * @param {string} split - Green/red ratio like "60/40" (default: "60/40")
 */
export default function CymruRibbon({
  className,
  height = "h-[3px]",
  spark = false,
  split = "60/40",
}) {
  // Parse split ratio
  const [greenPercent] = split.split("/").map((s) => s.trim());

  return (
    <div className={cn("relative flex w-full overflow-hidden", height, className)}>
      {/* Gradient transition across full width */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--ribbon-green))] via-[hsl(var(--ribbon-green))] to-[hsl(var(--ribbon-red))]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--ribbon-green)) 0%, hsl(var(--ribbon-green)) calc(${greenPercent}% - 5%), hsl(var(--ribbon-red)) calc(${greenPercent}% + 5%), hsl(var(--ribbon-red)) 100%)`
        }}
      />

      {/* Gold spark dot at boundary (optional) */}
      {spark && (
        <div
          className="absolute top-1/2 left-[var(--spark-position)] -translate-x-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--ribbon-spark))] ring-2 ring-[hsl(var(--background))] z-10"
          style={{ "--spark-position": `${greenPercent}%` }}
        />
      )}
    </div>
  );
}
