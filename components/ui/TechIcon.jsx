import { techIcon } from "@/lib/tech-icons";
import { cn } from "@/lib/cn";

export default function TechIcon({ name, size = 20, className }) {
  const icon = techIcon(name);

  if (!icon) {
    return (
      <span
        aria-hidden
        className={cn("grid shrink-0 place-items-center rounded-md bg-accent/15 font-mono font-bold text-accent", className)}
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        {name[0]}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external animated SVGs, nothing to optimize
    <img
      src={icon.src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={icon.scale !== 1 ? { transform: `scale(${icon.scale})` } : undefined}
      className={cn("shrink-0", icon.mono && "dark:brightness-0 dark:invert", icon.rounded && "rounded-md", className)}
    />
  );
}
