import TechIcon from "./TechIcon";

export default function Marquee({ items }) {
  const row = [...items, ...items];
  return (
    <div className="marquee relative overflow-hidden py-6" aria-hidden>
      <div className="marquee-track flex w-max items-center gap-12">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-4 font-display text-3xl whitespace-nowrap text-muted md:text-5xl">
            <TechIcon name={item} size={44} />
            {item}
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
