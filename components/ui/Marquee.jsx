export default function Marquee({ items }) {
  const row = [...items, ...items];
  return (
    <div className="marquee relative overflow-hidden py-6" aria-hidden>
      <div className="marquee-track flex w-max gap-10">
        {row.map((item, i) => (
          <span key={i} className="font-display text-3xl whitespace-nowrap text-muted md:text-5xl">
            {item} <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
