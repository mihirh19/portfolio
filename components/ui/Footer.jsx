import LocalTime from "./LocalTime";
import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 font-mono text-xs text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. Built with Next.js, R3F & a lot of chai.</p>
        <p>
          {site.location.split(",")[0]} · <LocalTime timeZone={site.timezone} /> IST
        </p>
        <a href="#main" className="hover:text-fg">Back to top ↑</a>
      </div>
    </footer>
  );
}
