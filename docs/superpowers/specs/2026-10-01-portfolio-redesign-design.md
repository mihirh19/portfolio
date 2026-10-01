# Portfolio Redesign — "AI Neural Cosmos"

Date: 2026-10-01
Status: Approved design, pending spec review

## Goal

Rebuild the portfolio (currently Next.js Pages Router) on the **Next.js 16 App Router** as a unique, cinematic, scroll-driven site with a reactive 3D particle scene, rich motion, and modern UX extras — while staying fast and accessible.

## Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Creative direction | AI neural cosmos — 3D particle "neural network" that morphs per section |
| Structure | One long-scroll home + `/projects/[slug]` detail pages |
| Theme | Keep light + dark (next-themes); 3D palette adapts |
| Project content | Written manually in `content/site.js` (placeholders added for the owner to fill) |
| Extras | Command palette (Ctrl+K), contact via Server Action + Resend, custom magnetic cursor, intro loader |
| Animation stack | Approach A: React Three Fiber + drei + postprocessing, Motion, GSAP + ScrollTrigger, Lenis |
| Runtime / PM | Bun; latest versions of all dependencies |

## Stack

- `next` (latest, App Router, Turbopack), `react` / `react-dom` 19
- `tailwindcss` v4 + `@tailwindcss/postcss`
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `motion` (UI motion, layout, cursor)
- `next-view-transitions` (shared-element route transitions via the View Transitions API)
- `gsap` + `@gsap/react` (ScrollTrigger, SplitText)
- `lenis` (smooth scroll, synced with ScrollTrigger and the R3F frame loop)
- `next-themes`, `cmdk`, `resend`, `zod`, `@vercel/analytics`
- Dev: `@playwright/test`
- Removed: `axios`, `react-animated-cursor`, `react-rough-notation`, `pages/`, old `components/`, `turbo.json`

## Architecture

```
app/
  layout.jsx            # html/body, fonts, <Providers>, fixed <SceneCanvas>, <Nav>, <Cursor>, <CommandPalette>, <Loader>, <Grain>
  page.jsx              # long-scroll home: Hero, About, Skills, Projects, Experience, GitHub, Contact
  projects/[slug]/page.jsx   # generateStaticParams + generateMetadata from content/site.js
  not-found.jsx
  opengraph-image.jsx   # dynamic OG image
  sitemap.js, robots.js
  actions/contact.js    # "use server" — zod validate + Resend send
components/
  providers/            # ThemeProvider, SmoothScroll (Lenis+ScrollTrigger), SceneStateProvider
  scene/                # SceneCanvas, Particles (instanced + shader), shapes.js, palettes.js
  sections/             # Hero, About, Skills, Projects, Experience, GitHub, Contact
  ui/                   # Nav, Cursor, CommandPalette, Loader, MagneticButton, SplitText, SpotlightCard, Marquee, Grain, ScrollProgress
content/
  site.js               # all copy, projects (slug, title, summary, tech[], highlights[], repo, demo, image), experience, socials, skills
lib/
  github.js             # server-only fetch of latest repos (revalidate: 3600)
  contact-schema.js     # zod schema shared by action + tests
```

### Server/client boundary

- Pages and sections are Server Components by default; animated parts are small `"use client"` islands.
- GitHub data is fetched on the server with `fetch(..., { next: { revalidate: 3600 } })`; `GITHUB_AUTH_TOKEN` never reaches the client.
- `SceneCanvas` is loaded via `next/dynamic` with `ssr: false` and mounted after first paint.

### 3D scene

- One fixed full-viewport `<Canvas>` behind all content, shared across routes (lives in the root layout).
- ~8k particles desktop / ~3k mobile, rendered as instanced points with a custom shader.
- Target shapes precomputed once as Float32Array buffers in `shapes.js`: `brain`, `network`, `rings`, `grid`, `helix`, `galaxy`, `orb`, plus a `scatter` start state.
- Shader blends `positionA → positionB` by a `uMorph` uniform; scroll progress (from ScrollTrigger) sets `{ from, to, progress }` in a shared store (`SceneStateProvider`, a lightweight ref/zustand-free store via `useSyncExternalStore`).
- Cursor proximity: uniform `uPointer` repels and brightens nearby particles.
- Postprocessing: Bloom (dark theme), subtle vignette; light theme disables bloom and uses ink palette.
- Project pages set the scene to `orb`, dimmed and blurred.

### Theming

- `next-themes` with `attribute="class"`, default `dark`.
- CSS tokens in `globals.css` (`@theme`) for colors, fonts; `dark:` custom variant.
- `palettes.js` maps theme → particle colors / bloom on/off.

## Home storyline

| # | Section | UI | 3D shape |
|---|---|---|---|
| 0 | Loader | SVG name stroke + 0→100 counter, curtain wipe, ~1.5s, once per session (sessionStorage) | `scatter` → assembles |
| 1 | Hero | Split-text "Developer. Explorer. Gamer.", rotating role line, magnetic "View work" / "Resume" buttons | `brain`, cursor-reactive |
| 2 | About | Pinned; paragraphs reveal word-by-word on scroll scrub; 3D-tilt avatar card | `network` with traveling pulse |
| 3 | Skills | Bento grid of glass spotlight cards (AI/ML, Frontend, Backend, Languages) + marquee of chips | `rings` |
| 4 | Projects | Pinned horizontal rail of large cards (hover-zoom image, index, title, tech); cursor becomes "View"; click → shared-element view transition to project page | `grid` |
| 5 | Experience | Timeline line draws on scroll; entries alternate sides | `helix` |
| 6 | GitHub | Latest 6 repos (stars, language dot, animated counters) | `galaxy` |
| 7 | Contact | "Let's build something" headline, floating-label form, morphing submit button (idle → loading → ✓/✗), magnetic socials, footer with local time + back-to-top | `orb`, pulses on submit |

### Project page `/projects/[slug]`

Hero image (shared-element from the card via the View Transitions API using `next-view-transitions`; Motion `layoutId` cannot span App Router route changes), title, summary, tech stack, highlights, GitHub/demo links, "Next project" link. `generateStaticParams` prebuilds all slugs; unknown slug → `notFound()`.

### Global UI

- Floating pill nav: hides on scroll down, shows on scroll up, animated active-section indicator (IntersectionObserver).
- Command palette (`cmdk`, Ctrl/⌘+K): jump to sections/projects, open socials, toggle theme, copy email.
- Custom cursor: dot + lagging ring; grows to "View" on `[data-cursor="view"]`, sticks to `[data-cursor="magnetic"]`; only when `(pointer: fine)`.
- Film-grain overlay, scroll progress bar.

### Typography

Display: Space Grotesk (variable, via `next/font/google`). Body: Inter (`next/font`). Mono: existing Ubuntu Mono from `fonts/` via `next/font/local`.

## Contact Server Action

- `app/actions/contact.js` (`"use server"`), used with `useActionState`.
- Validates `{ name, email, message, website }` with zod (`lib/contact-schema.js`); `website` is a honeypot — non-empty → silently succeed without sending.
- Sends via Resend to the owner email using `RESEND_API_KEY` (and `CONTACT_TO_EMAIL`, default from `content/site.js`).
- Returns `{ status: "success" | "error", errors?, message? }`. Missing key or Resend failure → error state with mailto fallback link.

## Performance

- Canvas: dynamic import, DPR clamp `[1, 1.5]`, `frameloop` paused when tab hidden, adaptive particle count; WebGL unavailable → static CSS gradient fallback.
- No per-frame CPU morphing (GPU shader only).
- `next/image` (AVIF/WebP, blur placeholders), `next/font`.
- LCP element is server-rendered hero text, not the canvas.
- Targets: Lighthouse perf ≥ 85 mobile / ≥ 95 desktop, LCP < 2.5s.

## Accessibility

- `prefers-reduced-motion`: Lenis off, no pinning/scrub (content shown statically), loader skipped, scene static.
- Custom cursor only for fine pointers; native cursor elsewhere.
- Visible focus rings, skip-to-content link, semantic landmarks, palette keyboard accessible.
- WCAG AA contrast in both themes.

## Error handling

- GitHub fetch failure → section not rendered (no crash).
- Unknown project slug → `not-found.jsx`.
- Contact errors → inline field errors / error state + mailto fallback.

## Testing

- `bun run build` passes.
- Unit (`bun test`): contact schema + action logic (honeypot, validation, missing key).
- E2E (Playwright, `bun run test:e2e`): home renders all sections; nav jumps to section; Ctrl+K opens palette; project page loads; unknown slug 404s; contact validation errors appear; reduced-motion emulation renders.
- Manual visual pass at desktop + mobile widths in both themes.

## Housekeeping

- Delete `pages/`, old `components/`, `constants/`, `lib/getLatestRepos.js`, `turbo.json`, `styles/Home.module.css`.
- Migrate `constants/data.js` → `content/site.js` with new fields (`slug`, `summary`, `tech[]`, `highlights[]`, `demo`) as placeholders.
- Dockerfile → `oven/bun` image, `bun install --frozen-lockfile`, `bun run build`, `bun run start`.
- Un-ignore `bun.lock` in `.gitignore` so the lockfile is committed.
- `.env.example` with `GITHUB_AUTH_TOKEN`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`.

## Out of scope

Blog/CMS, i18n, analytics beyond `@vercel/analytics`, 3D model assets (GLTF), auto-fetching READMEs.
