"use client";

import { useEffect, useState } from "react";

export default function LocalTime({ timeZone }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return <span className="tabular-nums">{time}</span>;
}
