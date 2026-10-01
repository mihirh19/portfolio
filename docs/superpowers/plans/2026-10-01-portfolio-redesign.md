# Portfolio Redesign ("AI Neural Cosmos") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio on the Next.js 16 App Router as a cinematic long-scroll site with a scroll-morphing 3D particle scene, project detail pages, and UX extras (command palette, custom cursor, intro loader, Server Action contact form).

**Architecture:** Server Components for pages/sections, small `"use client"` islands for animation. One fixed React Three Fiber canvas in the root layout renders ~8k GPU-morphed particles; a tiny external store (`lib/scene-store.js`) carries scroll progress computed from `[data-scene]` sections. Lenis drives smooth scroll synced to GSAP ScrollTrigger; Motion handles UI micro-interactions.

**Tech Stack:** Bun 1.3, Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, three / @react-three/fiber 9 / drei 10 / @react-three/postprocessing 3, motion 13, gsap 3.15 + @gsap/react, lenis 1.3, next-view-transitions, cmdk, resend, zod 4, next-themes, @playwright/test.

**Spec:** `docs/superpowers/specs/2026-10-01-portfolio-redesign-design.md`

## Global Constraints

- Use **Bun only**: `bun add`, `bun remove`, `bunx`, `bun run`, `bun test`. Never npm/npx/yarn/pnpm.
- Plain JavaScript (`.js` / `.jsx`), no TypeScript. Import alias `@/*` → project root.
- All dependencies at latest versions.
- Commit messages: plain conventional messages, **no Co-Authored-By / Claude attribution lines**.
- Light + dark theme via `next-themes` (`attribute="class"`, `defaultTheme="dark"`).
- `prefers-reduced-motion: reduce` → no Lenis, no pinning/scrub, no loader, static scene.
- Custom cursor only when `(pointer: fine)`.
- `GITHUB_AUTH_TOKEN` and `RESEND_API_KEY` used only on the server.
- Section ids (used by nav, palette, tests): `hero`, `about`, `skills`, `projects`, `experience`, `github`, `contact`.
- Scene shapes: `brain`, `network`, `rings`, `grid`, `helix`, `galaxy`, `orb`, `scatter`.
- Particle count: 8000 desktop / 3000 when `innerWidth < 768`. Canvas DPR `[1, 1.5]`.
- Unit tests live in `tests/unit` (`bun test tests/unit`); E2E in `tests/e2e` (Playwright).

## File Map

```
app/
  layout.jsx                    root html/body, fonts, providers, scene, nav, cursor, palette, loader, footer
  page.jsx                      home: sections in order
  globals.css                   Tailwind v4 + theme tokens + component classes
  not-found.jsx
  opengraph-image.jsx
  sitemap.js / robots.js
  actions/contact.js            "use server" wrapper around lib/handle-contact
  projects/[slug]/page.jsx
  projects/[slug]/opengraph-image.jsx
components/
  providers/Providers.jsx       ThemeProvider + MotionConfig + SmoothScroll
  providers/SmoothScroll.jsx    Lenis + GSAP ticker sync
  scene/shapes.js               pure: buildShapes(count, seed) → { [name]: Float32Array }
  scene/progress.js             pure: computeSceneProgress(rects, vh)
  scene/palettes.js             theme → colors/bloom
  scene/shaders.js              GLSL strings
  scene/Particles.jsx           R3F points + uniforms driven by store
  scene/SceneCanvas.jsx         <Canvas> + bloom + fallback
  scene/SceneMount.jsx          next/dynamic ssr:false wrapper
  scene/ScrollSceneSync.jsx     DOM rects → store
  scene/SceneOverride.jsx       per-page shape override
  sections/Hero.jsx About.jsx Skills.jsx Projects.jsx ProjectCard.jsx Experience.jsx GitHub.jsx Contact.jsx
  ui/Magnetic.jsx SplitReveal.jsx RotatingWords.jsx SpotlightCard.jsx TiltCard.jsx Marquee.jsx
  ui/Grain.jsx ScrollProgress.jsx CountUp.jsx Nav.jsx ThemeToggle.jsx Footer.jsx LocalTime.jsx
  ui/Cursor.jsx CommandPalette.jsx Loader.jsx
content/site.js                 all copy & data
lib/
  cn.js                         className join
  scene-store.js                external mutable store
  scroll.js                     scrollToSection(lenis, id)
  command-palette-events.js     openCommandPalette() event helper
  github.js                     getLatestRepos()
  contact-schema.js             zod schema
  handle-contact.js             validation + send orchestration (pure, injectable)
  loader-script.js              inline head script string
tests/unit/*.test.js
tests/e2e/*.spec.js
playwright.config.js
```

---

### Task 1: App Router foundation, toolchain, content, test harness

**Files:**
- Delete: `pages/`, `components/*` (old), `constants/`, `lib/getLatestRepos.js`, `styles/`, `tailwind.config.js` (already gone), `turbo.json`
- Modify: `package.json`, `jsconfig.json`, `next.config.js`, `.gitignore`
- Create: `app/layout.jsx`, `app/page.jsx`, `app/globals.css`, `components/providers/Providers.jsx`, `content/site.js`, `lib/cn.js`, `playwright.config.js`, `tests/e2e/home.spec.js`, `tests/unit/site.test.js`

**Interfaces:**
- Produces: `site` object and helpers `getProject(slug)`, `getNextProject(slug)` from `@/content/site`; `cn(...classes)` from `@/lib/cn`; CSS tokens/classes `bg-bg text-fg text-muted bg-card border-line text-accent text-accent-2 font-display font-sans font-mono`, component classes `.btn-primary .btn-ghost .chip .eyebrow .section-title .glass .skip-link`; `<Providers>` (extended in Task 6).

- [ ] **Step 1: Remove old code and dependencies**

```bash
git rm -rq pages components constants lib/getLatestRepos.js styles turbo.json
bun remove axios react-animated-cursor react-rough-notation
```

- [ ] **Step 2: Add new dependencies**

```bash
bun add three @react-three/fiber @react-three/drei @react-three/postprocessing gsap @gsap/react lenis next-view-transitions cmdk resend zod
bun add -d @playwright/test
bunx playwright install chromium
```

- [ ] **Step 3: Update `package.json` scripts** (keep dependency entries Bun wrote)

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "bun test tests/unit",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Replace `jsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

- [ ] **Step 5: Replace `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
};

module.exports = nextConfig;
```

- [ ] **Step 6: Un-ignore the Bun lockfile and ignore test output.** In `.gitignore` delete the line `bun.lock` and append:

```
# playwright
/test-results/
/playwright-report/
```

- [ ] **Step 7: Create `lib/cn.js`**

```js
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 8: Create `content/site.js`** (project `summary`/`tech`/`highlights` are drafts for the owner to rewrite)

```js
// Owner: rewrite the project summaries, tech and highlights below in your own words.
export const site = {
  name: "Mihir Hadavani",
  role: "Software Engineer",
  roles: ["AI/ML engineer", "full-stack developer", "generative-AI builder", "gamer"],
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  githubUsername: "mihirh19",
  email: "miheerhadvani990@gmail.com",
  location: "Junagadh, Gujarat, India",
  timezone: "Asia/Kolkata",
  avatar: "/Newavtar.gif",
  resumeUrl:
    "https://drive.google.com/file/d/1xmE3BOmgM7TAOOgVp36xQIQvYDntDYoo/view?usp=sharing",
  socials: [
    { label: "GitHub", href: "https://github.com/mihirh19" },
    { label: "LinkedIn", href: "https://linkedin.com/in/mihir-hadavani-996263232" },
    { label: "X / Twitter", href: "https://twitter.com/mihirh21" },
    { label: "Instagram", href: "https://www.instagram.com/_mihirh.21" },
    { label: "Facebook", href: "https://facebook.com/mihir2107" },
  ],
  about: {
    headline:
      "I'm an AI/ML and full-stack developer who builds products that think — integrating generative AI into fast, delightful web apps.",
    paragraphs: [
      `I started building full-stack applications at seventeen, before I even knew what "full-stack" meant. Once HTML and CSS clicked, frameworks like Tailwind and Bootstrap made me feel unstoppable.`,
      `Since then I've shipped with React, Next.js, Node.js, Express, MongoDB, MySQL, C++, Python, FastAPI and more — and yes, I still check Stack Overflow for syntax.`,
      `Today I work where full-stack meets machine learning and generative AI. It's an exciting time to be a developer, and I'm thrilled to be building at that intersection.`,
    ],
  },
  skills: [
    { group: "AI / ML", items: ["Python", "scikit-learn", "NumPy", "Pandas", "LangChain", "Generative AI"] },
    { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "JavaScript", "HTML", "CSS"] },
    { group: "Backend", items: ["Node.js", "Express", "FastAPI", "Django", "Flask", "MongoDB", "MySQL", "PostgreSQL"] },
    { group: "Tools & Cloud", items: ["Git", "Docker", "Kubernetes", "AWS", "Postman", "Solidity", "C++", "Java"] },
  ],
  projects: [
    {
      slug: "finguru",
      title: "FinGuru: News Research Tool",
      image: "/finguru.png",
      repo: "https://github.com/mihirh19/news_research_tool_Equity-Research-Analysis-",
      demo: null,
      summary:
        "An equity-research assistant that ingests news articles and PDFs and answers questions about them with retrieval-augmented generation.",
      tech: ["Python", "LangChain", "Google Embeddings", "Streamlit"],
      highlights: [
        "Fetches and parses articles from URLs or uploaded PDFs",
        "Splits content into chunks and embeds them for semantic search",
        "Answers questions with cited sources",
      ],
    },
    {
      slug: "cashcraft",
      title: "CashCraft",
      image: "/cashcraft.png",
      repo: "https://github.com/mihirh19/cashcraft",
      demo: null,
      summary: "A personal-finance app for tracking income, expenses and budgets.",
      tech: ["React", "Node.js", "MongoDB"],
      highlights: ["Expense and income tracking", "Budget overview dashboard", "Authentication"],
    },
    {
      slug: "crowdfunding",
      title: "CrowdFunding Web3 App",
      image: "/crowdfunding.png",
      repo: "https://github.com/mihirh19/crowdfunding",
      demo: null,
      summary: "A decentralized crowdfunding platform where campaigns and donations live on-chain.",
      tech: ["Solidity", "React", "Ethers.js"],
      highlights: ["Create and fund campaigns from a wallet", "Smart-contract-backed transparency", "Campaign progress tracking"],
    },
    {
      slug: "todo-app",
      title: "Todo App",
      image: "/todo.png",
      repo: "https://github.com/mihirh19/todo_web_app",
      demo: null,
      summary: "A clean task manager with create, complete and delete flows.",
      tech: ["JavaScript", "HTML", "CSS"],
      highlights: ["Add, complete and remove tasks", "Persistent storage", "Responsive layout"],
    },
    {
      slug: "placement-recommendation",
      title: "Placement Recommendation",
      image: "/placement.png",
      repo: "https://github.com/mihirh19/placement-recommendation",
      demo: null,
      summary: "A machine-learning model that predicts placement outcomes and recommends improvements for students.",
      tech: ["Python", "scikit-learn", "Pandas"],
      highlights: ["Data cleaning and feature engineering", "Model comparison and tuning", "Interactive prediction UI"],
    },
    {
      slug: "newsgenix",
      title: "Newsgenix",
      image: "/Newsgenix.png",
      repo: "https://github.com/mihirh19/NewsMonkey",
      demo: null,
      summary: "A category-based news reader with infinite scrolling.",
      tech: ["React", "News API"],
      highlights: ["Category browsing", "Infinite scroll", "Loading progress bar"],
    },
    {
      slug: "inotebook",
      title: "iNoteBook",
      image: "/INotebook.png",
      repo: "https://github.com/mihirh19/inotebook",
      demo: null,
      summary: "A secure cloud notebook for writing and organizing notes.",
      tech: ["React", "Express", "MongoDB", "JWT"],
      highlights: ["User authentication", "Create, edit and delete notes", "REST API backend"],
    },
    {
      slug: "zomato-clone",
      title: "Zomato Clone",
      image: "/Zomato.png",
      repo: "https://github.com/mihirh19/zomato_front_clone",
      demo: null,
      summary: "A front-end recreation of the Zomato food-delivery landing experience.",
      tech: ["HTML", "CSS", "JavaScript"],
      highlights: ["Pixel-faithful responsive layout", "Search and collections UI"],
    },
  ],
  experience: [
    {
      title: "B.Tech, Information Technology",
      org: "Dharmsinh Desai University, Nadiad",
      year: "2025",
      href: "https://www.ddu.ac.in",
      desc: "Graduated with a CGPA of 8.98. Nobody asks this, but it's okay.",
    },
    {
      title: "Full-stack Intern",
      org: "Devtown",
      year: "2022",
      href: "https://www.devtown.in",
      desc: "Developed a full-stack application with the MERN stack.",
    },
    {
      title: "Higher Secondary School",
      org: "Modi School, Rajkot",
      year: "2021",
      href: "https://school.careers360.com/schools/modi-school-ishwariya-rajkot",
      desc: "PCM — barely survived with a 94% aggregate. Flex Fridays, fellas.",
    },
    {
      title: "Secondary School",
      org: "Genius International School, Keshod",
      year: "2019",
      href: null,
      desc: "Barely survived with a 90% aggregate.",
    },
  ],
};

export function getProject(slug) {
  return site.projects.find((p) => p.slug === slug);
}

export function getNextProject(slug) {
  const i = site.projects.findIndex((p) => p.slug === slug);
  return site.projects[(i + 1) % site.projects.length];
}
```

- [ ] **Step 9: Write the failing unit test `tests/unit/site.test.js`**

```js
import { describe, expect, test } from "bun:test";
import { site, getProject, getNextProject } from "@/content/site";

describe("content/site", () => {
  test("every project has a unique slug and required fields", () => {
    const slugs = site.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of site.projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.image.startsWith("/")).toBe(true);
      expect(Array.isArray(p.tech)).toBe(true);
      expect(Array.isArray(p.highlights)).toBe(true);
    }
  });

  test("getProject finds by slug and returns undefined for unknown", () => {
    expect(getProject("finguru").title).toContain("FinGuru");
    expect(getProject("nope")).toBeUndefined();
  });

  test("getNextProject wraps around", () => {
    const last = site.projects.at(-1).slug;
    expect(getNextProject(last).slug).toBe(site.projects[0].slug);
  });
});
```

- [ ] **Step 10: Run it**

Run: `bun test tests/unit`
Expected: 3 pass (content was written in Step 8; this guards future edits).

- [ ] **Step 11: Create `app/globals.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg: #f6f4ef;
  --fg: #121212;
  --muted: #5b5b66;
  --accent: #4f46e5;
  --accent-2: #f97316;
  --card: rgb(0 0 0 / 0.03);
  --line: rgb(0 0 0 / 0.1);
}

.dark {
  --bg: #05060a;
  --fg: #e8eaf2;
  --muted: #8a90a6;
  --accent: #7c5cff;
  --accent-2: #22d3ee;
  --card: rgb(255 255 255 / 0.04);
  --line: rgb(255 255 255 / 0.1);
}

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  --color-card: var(--card);
  --color-line: var(--line);
  --font-display: var(--font-space-grotesk), ui-sans-serif, system-ui;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui;
  --font-mono: var(--font-ubuntu-mono), ui-monospace, monospace;
}

@layer base {
  html {
    background: var(--bg);
    color-scheme: light;
  }
  html.dark {
    color-scheme: dark;
  }
  ::selection {
    background: var(--accent);
    color: white;
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-full bg-fg px-7 py-3.5 font-medium text-bg transition-colors hover:bg-accent hover:text-white;
  }
  .btn-ghost {
    @apply inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 font-medium transition-colors hover:border-fg;
  }
  .chip {
    @apply rounded-full border border-line px-3 py-1 font-mono text-xs text-muted;
  }
  .eyebrow {
    @apply font-mono text-xs tracking-[0.3em] text-muted uppercase;
  }
  .section-title {
    @apply mt-4 font-display text-5xl leading-none font-semibold tracking-tight md:text-7xl;
  }
  .glass {
    @apply rounded-3xl border border-line bg-card backdrop-blur-md;
  }
  .skip-link {
    @apply fixed top-3 left-3 z-[200] -translate-y-24 rounded-full bg-fg px-4 py-2 text-bg focus:translate-y-0;
  }
}
```

- [ ] **Step 12: Create `components/providers/Providers.jsx`**

```jsx
"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
```

- [ ] **Step 13: Create `app/layout.jsx`**

```jsx
import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import Providers from "@/components/providers/Providers";
import { site } from "@/content/site";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = localFont({
  src: "../fonts/Ubuntu-Mono-bold.woff2",
  variable: "--font-ubuntu-mono",
  weight: "700",
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — AI/ML & Full-stack Developer`, template: `%s — ${site.name}` },
  description: site.about.headline,
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05060a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${display.variable} ${sans.variable} ${mono.variable}`}
      >
        <body className="bg-bg font-sans text-fg antialiased">
          <a href="#main" className="skip-link">Skip to content</a>
          <Providers>
            <main id="main" className="relative z-10">{children}</main>
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
```

- [ ] **Step 14: Create placeholder `app/page.jsx`**

```jsx
import { site } from "@/content/site";

export default function Home() {
  return (
    <section id="hero" className="flex min-h-svh items-center px-6">
      <h1 className="font-display text-7xl">{site.name}</h1>
    </section>
  );
}
```

- [ ] **Step 15: Create `playwright.config.js`**

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3100", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 16: Create `tests/e2e/home.spec.js`**

```js
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
});

test("home renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

- [ ] **Step 17: Verify build and e2e**

Run: `bun run build`
Expected: build succeeds, route `/` listed.
Run: `bun run test:e2e`
Expected: 1 passed.

- [ ] **Step 18: Commit**

```bash
git add -A
git commit -m "feat: migrate to App Router foundation with Tailwind 4 tokens and test harness"
```

---

### Task 2: Contact validation + Server Action

**Files:**
- Create: `lib/contact-schema.js`, `lib/handle-contact.js`, `app/actions/contact.js`
- Test: `tests/unit/handle-contact.test.js`

**Interfaces:**
- Produces: `sendContact(prevState, formData)` server action returning `{ status: "idle"|"success"|"error", errors?: { name?: string[], email?: string[], message?: string[] }, message?: string }`. `handleContact(formData, { send })` where `send({ name, email, message }) → Promise<void>` or `null` when email is not configured.

- [ ] **Step 1: Write the failing test `tests/unit/handle-contact.test.js`**

```js
import { describe, expect, test, mock } from "bun:test";
import { handleContact } from "@/lib/handle-contact";

function fd(fields) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there, let's build something." };

describe("handleContact", () => {
  test("honeypot filled → success without sending", async () => {
    const send = mock(async () => {});
    const res = await handleContact(fd({ ...valid, website: "spam.com" }), { send });
    expect(res.status).toBe("success");
    expect(send).not.toHaveBeenCalled();
  });

  test("invalid fields → error with field messages", async () => {
    const send = mock(async () => {});
    const res = await handleContact(fd({ name: "A", email: "bad", message: "short" }), { send });
    expect(res.status).toBe("error");
    expect(res.errors.name[0]).toBe("Please enter your name");
    expect(res.errors.email[0]).toBe("Please enter a valid email");
    expect(res.errors.message[0]).toBe("Message should be at least 10 characters");
    expect(send).not.toHaveBeenCalled();
  });

  test("valid + no sender configured → error", async () => {
    const res = await handleContact(fd(valid), { send: null });
    expect(res).toEqual({ status: "error", message: "Email isn't configured yet — please use the email link instead." });
  });

  test("valid → sends trimmed data and succeeds", async () => {
    const send = mock(async () => {});
    const res = await handleContact(fd({ ...valid, name: "  Ada Lovelace  " }), { send });
    expect(res).toEqual({ status: "success" });
    expect(send).toHaveBeenCalledWith({ name: "Ada Lovelace", email: valid.email, message: valid.message });
  });

  test("sender throws → error", async () => {
    const send = mock(async () => {
      throw new Error("boom");
    });
    const res = await handleContact(fd(valid), { send });
    expect(res).toEqual({ status: "error", message: "Something went wrong sending your message. Please try again." });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test tests/unit/handle-contact.test.js`
Expected: FAIL — cannot resolve `@/lib/handle-contact`.

- [ ] **Step 3: Create `lib/contact-schema.js`**

```js
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().pipe(z.email("Please enter a valid email")),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(5000, "Message is too long"),
});
```

- [ ] **Step 4: Create `lib/handle-contact.js`**

```js
import { z } from "zod";
import { contactSchema } from "./contact-schema";

export async function handleContact(formData, { send }) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  if (String(formData.get("website") ?? "")) return { status: "success" };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  if (!send) {
    return { status: "error", message: "Email isn't configured yet — please use the email link instead." };
  }

  try {
    await send(parsed.data);
    return { status: "success" };
  } catch {
    return { status: "error", message: "Something went wrong sending your message. Please try again." };
  }
}
```

- [ ] **Step 5: Run tests**

Run: `bun test tests/unit`
Expected: all pass.

- [ ] **Step 6: Create `app/actions/contact.js`**

```js
"use server";

import { Resend } from "resend";
import { handleContact } from "@/lib/handle-contact";
import { site } from "@/content/site";

export async function sendContact(_prevState, formData) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;

  const send = key
    ? async ({ name, email, message }) => {
        const resend = new Resend(key);
        const { error } = await resend.emails.send({
          from: "Portfolio <onboarding@resend.dev>",
          to,
          replyTo: email,
          subject: `New portfolio message from ${name}`,
          text: `${message}\n\n— ${name} <${email}>`,
        });
        if (error) throw new Error(error.message);
      }
    : null;

  return handleContact(formData, { send });
}
```

- [ ] **Step 7: Verify build**

Run: `bun run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add lib/contact-schema.js lib/handle-contact.js app/actions/contact.js tests/unit/handle-contact.test.js
git commit -m "feat: add contact server action with zod validation and honeypot"
```

---

### Task 3: GitHub data loader

**Files:**
- Create: `lib/github.js`
- Test: `tests/unit/github.test.js`

**Interfaces:**
- Produces: `getLatestRepos({ username, token?, limit = 6, fetchImpl = fetch }) → Promise<Array<{ id, name, description, url, stars, language, updatedAt }>>` — never throws; `[]` on failure. Also `languageColor(language) → string` hex.

- [ ] **Step 1: Write the failing test `tests/unit/github.test.js`**

```js
import { describe, expect, test, mock } from "bun:test";
import { getLatestRepos, languageColor } from "@/lib/github";

const apiRepo = (o) => ({
  id: 1, name: "repo", description: "d", html_url: "https://github.com/u/repo",
  stargazers_count: 3, language: "Python", pushed_at: "2026-09-01T00:00:00Z", fork: false, ...o,
});

describe("getLatestRepos", () => {
  test("maps fields, skips forks, respects limit, sends token + revalidate", async () => {
    const fetchImpl = mock(async () => ({
      ok: true,
      json: async () => [apiRepo({ id: 1 }), apiRepo({ id: 2, fork: true }), apiRepo({ id: 3 }), apiRepo({ id: 4 })],
    }));
    const repos = await getLatestRepos({ username: "u", token: "t", limit: 2, fetchImpl });
    expect(repos).toEqual([
      { id: 1, name: "repo", description: "d", url: "https://github.com/u/repo", stars: 3, language: "Python", updatedAt: "2026-09-01T00:00:00Z" },
      { id: 3, name: "repo", description: "d", url: "https://github.com/u/repo", stars: 3, language: "Python", updatedAt: "2026-09-01T00:00:00Z" },
    ]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.github.com/users/u/repos?sort=pushed&per_page=30");
    expect(init.headers.Authorization).toBe("Bearer t");
    expect(init.next).toEqual({ revalidate: 3600 });
  });

  test("no token → no Authorization header", async () => {
    const fetchImpl = mock(async () => ({ ok: true, json: async () => [] }));
    await getLatestRepos({ username: "u", fetchImpl });
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test("non-ok or thrown → []", async () => {
    expect(await getLatestRepos({ username: "u", fetchImpl: async () => ({ ok: false }) })).toEqual([]);
    expect(await getLatestRepos({ username: "u", fetchImpl: async () => { throw new Error("x"); } })).toEqual([]);
  });
});

test("languageColor has a fallback", () => {
  expect(languageColor("JavaScript")).toBe("#f1e05a");
  expect(languageColor("Klingon")).toBe("#8a90a6");
  expect(languageColor(null)).toBe("#8a90a6");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test tests/unit/github.test.js`
Expected: FAIL — cannot resolve `@/lib/github`.

- [ ] **Step 3: Create `lib/github.js`**

```js
const COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  Java: "#b07219",
  Solidity: "#AA6746",
};

export function languageColor(language) {
  return COLORS[language] ?? "#8a90a6";
}

export async function getLatestRepos({ username, token, limit = 6, fetchImpl = fetch }) {
  try {
    const headers = { Accept: "application/vnd.github+json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetchImpl(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=30`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .filter((r) => !r.fork)
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.pushed_at,
      }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run tests**

Run: `bun test tests/unit`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/github.js tests/unit/github.test.js
git commit -m "feat: add GitHub latest-repos loader"
```

---

### Task 4: Scene store, shapes, scroll progress (pure logic)

**Files:**
- Create: `lib/scene-store.js`, `components/scene/shapes.js`, `components/scene/progress.js`
- Test: `tests/unit/scene.test.js`

**Interfaces:**
- Produces:
  - `sceneStore.get() → { sequence: string[], progress: number, override: string|null, dimmed: boolean, assemble: number, pulse: number }`, `sceneStore.set(patch)`, `sceneStore.subscribe(fn) → unsubscribe`.
  - `SHAPE_NAMES` = `["brain","network","rings","grid","helix","galaxy","orb","scatter"]`; `buildShapes(count, seed = 7) → Record<shapeName, Float32Array(count*3)>`.
  - `computeSceneProgress(rects: {top,bottom}[], viewportHeight) → number` in `[0, rects.length - 1]`.

- [ ] **Step 1: Write the failing test `tests/unit/scene.test.js`**

```js
import { describe, expect, test, mock } from "bun:test";
import { sceneStore } from "@/lib/scene-store";
import { buildShapes, SHAPE_NAMES } from "@/components/scene/shapes";
import { computeSceneProgress } from "@/components/scene/progress";

describe("sceneStore", () => {
  test("set merges and notifies; unsubscribe stops notifications", () => {
    const fn = mock(() => {});
    const off = sceneStore.subscribe(fn);
    sceneStore.set({ progress: 2.5 });
    expect(sceneStore.get().progress).toBe(2.5);
    expect(sceneStore.get().override).toBeNull();
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    sceneStore.set({ progress: 0 });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("buildShapes", () => {
  const shapes = buildShapes(500, 7);

  test("builds every shape with count*3 finite, bounded values", () => {
    expect(Object.keys(shapes).sort()).toEqual([...SHAPE_NAMES].sort());
    for (const name of SHAPE_NAMES) {
      const arr = shapes[name];
      expect(arr).toBeInstanceOf(Float32Array);
      expect(arr.length).toBe(1500);
      for (const v of arr) {
        expect(Number.isFinite(v)).toBe(true);
        expect(Math.abs(v)).toBeLessThan(6);
      }
    }
  });

  test("is deterministic for the same seed", () => {
    expect(buildShapes(500, 7).brain).toEqual(shapes.brain);
    expect(buildShapes(500, 8).brain).not.toEqual(shapes.brain);
  });
});

describe("computeSceneProgress", () => {
  const vh = 1000; // center line at 500
  const rects = (tops) => tops.map((t) => ({ top: t, bottom: t + 1000 }));

  test("empty → 0", () => expect(computeSceneProgress([], vh)).toBe(0));
  test("before first section → 0", () => expect(computeSceneProgress(rects([600, 1600]), vh)).toBe(0));
  test("first 60% of a section holds its shape", () => expect(computeSceneProgress(rects([0, 1000]), vh)).toBe(0));
  test("last 40% morphs to next", () => expect(computeSceneProgress(rects([-300, 700]), vh)).toBeCloseTo(0.5));
  test("inside last section → last index", () => expect(computeSceneProgress(rects([-2000, -1000, 0]), vh)).toBe(2));
  test("in a gap after a section → fully next", () =>
    expect(computeSceneProgress([{ top: -900, bottom: 100 }, { top: 800, bottom: 1800 }], vh)).toBe(1));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test tests/unit/scene.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `lib/scene-store.js`**

```js
const state = {
  sequence: [],
  progress: 0,
  override: null,
  dimmed: false,
  assemble: 1,
  pulse: 0,
};

const listeners = new Set();

export const sceneStore = {
  get: () => state,
  set(patch) {
    Object.assign(state, patch);
    listeners.forEach((l) => l());
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
```

- [ ] **Step 4: Create `components/scene/progress.js`**

```js
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Holds a section's shape for its first 60%, then morphs toward the next one.
export function computeSceneProgress(rects, viewportHeight) {
  const n = rects.length;
  if (!n) return 0;
  const center = viewportHeight / 2;

  let i = -1;
  for (let k = 0; k < n; k++) if (rects[k].top <= center) i = k;
  if (i === -1) return 0;
  if (i === n - 1) return n - 1;

  const { top, bottom } = rects[i];
  const frac = bottom > top ? (center - top) / (bottom - top) : 1;
  return i + clamp01((frac - 0.6) / 0.4);
}
```

- [ ] **Step 5: Create `components/scene/shapes.js`**

```js
export const SHAPE_NAMES = ["brain", "network", "rings", "grid", "helix", "galaxy", "orb", "scatter"];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

function fill(count, fn) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, y, z] = fn(i);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

function fibonacciPoint(i, count) {
  const y = 1 - (2 * (i + 0.5)) / count;
  const r = Math.sqrt(1 - y * y);
  const theta = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(theta) * r, y, Math.sin(theta) * r, theta];
}

const builders = {
  brain(count, rnd) {
    return fill(count, (i) => {
      const [x, y, z, theta] = fibonacciPoint(i, count);
      const fold = 1 + 0.07 * Math.sin(theta * 9) * Math.sin(y * 12);
      const r = 1.55 * fold * (0.92 + rnd() * 0.08);
      const gap = Math.sign(x || 1) * 0.12;
      return [x * r * 1.25 + gap, y * r * 0.95, z * r * 1.1];
    });
  },
  network(count, rnd) {
    const nodes = Array.from({ length: 16 }, () => [(rnd() - 0.5) * 6, (rnd() - 0.5) * 3.6, (rnd() - 0.5) * 2.5]);
    const edges = [];
    for (let a = 0; a < nodes.length; a++) {
      edges.push([a, (a + 1) % nodes.length]);
      edges.push([a, Math.floor(rnd() * nodes.length)]);
    }
    return fill(count, () => {
      const [a, b] = edges[Math.floor(rnd() * edges.length)];
      const t = rnd();
      const j = 0.05;
      return [0, 1, 2].map((k) => nodes[a][k] + (nodes[b][k] - nodes[a][k]) * t + (rnd() - 0.5) * j);
    });
  },
  rings(count, rnd) {
    const rings = [
      { r: 1.0, tilt: 0.3 },
      { r: 1.6, tilt: -0.5 },
      { r: 2.2, tilt: 0.9 },
      { r: 2.8, tilt: -1.2 },
    ];
    return fill(count, (i) => {
      const { r, tilt } = rings[i % rings.length];
      const a = rnd() * TAU;
      const rr = r + (rnd() - 0.5) * 0.08;
      const x = Math.cos(a) * rr;
      const y0 = Math.sin(a) * rr * 0.35;
      return [x, y0 * Math.cos(tilt), y0 * Math.sin(tilt) + (rnd() - 0.5) * 0.05];
    });
  },
  grid(count) {
    const cols = Math.ceil(Math.sqrt(count * 1.8));
    const rows = Math.ceil(count / cols);
    return fill(count, (i) => {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      const x = (cx / (cols - 1) - 0.5) * 9;
      const y = (cy / Math.max(rows - 1, 1) - 0.5) * 5;
      return [x, y, Math.sin(x * 0.8) * Math.cos(y * 0.8) * 0.3 - 0.5];
    });
  },
  helix(count, rnd) {
    return fill(count, (i) => {
      const t = i / count;
      const a = t * TAU * 5 + (i % 2) * Math.PI;
      const r = 1.1 + (rnd() - 0.5) * 0.1;
      return [Math.cos(a) * r, (t - 0.5) * 6, Math.sin(a) * r];
    });
  },
  galaxy(count, rnd) {
    const arms = 3;
    return fill(count, (i) => {
      const r = Math.pow(rnd(), 0.6) * 3.2;
      const a = ((i % arms) / arms) * TAU + r * 1.4;
      const spread = (0.35 * (3.2 - r)) / 3.2 + 0.05;
      return [
        Math.cos(a) * r + (rnd() - 0.5) * spread,
        (rnd() - 0.5) * spread * 0.6,
        Math.sin(a) * r + (rnd() - 0.5) * spread,
      ];
    });
  },
  orb(count, rnd) {
    return fill(count, (i) => {
      const [x, y, z] = fibonacciPoint(i, count);
      const r = 1.2 + (rnd() - 0.5) * 0.06;
      return [x * r, y * r, z * r];
    });
  },
  scatter(count, rnd) {
    return fill(count, () => [(rnd() - 0.5) * 10, (rnd() - 0.5) * 6, (rnd() - 0.5) * 6]);
  },
};

export function buildShapes(count, seed = 7) {
  const rnd = mulberry32(seed);
  const out = {};
  for (const name of SHAPE_NAMES) out[name] = builders[name](count, rnd);
  return out;
}
```

- [ ] **Step 6: Run tests**

Run: `bun test tests/unit`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/scene-store.js components/scene/shapes.js components/scene/progress.js tests/unit/scene.test.js
git commit -m "feat: add scene store, particle shapes and scroll progress math"
```

---

### Task 5: 3D particle scene rendering

**Files:**
- Create: `components/scene/palettes.js`, `components/scene/shaders.js`, `components/scene/Particles.jsx`, `components/scene/SceneCanvas.jsx`, `components/scene/SceneMount.jsx`, `components/scene/ScrollSceneSync.jsx`, `components/scene/SceneOverride.jsx`
- Modify: `app/layout.jsx`, `app/globals.css`

**Interfaces:**
- Consumes: `sceneStore`, `buildShapes`, `SHAPE_NAMES`, `computeSceneProgress` (Task 4).
- Produces: `<SceneMount />` and `<ScrollSceneSync />` (mounted in layout); `<SceneOverride shape="orb" dimmed />` for pages; sections opt in with `data-scene="<shape>"` on their root element; `sceneStore.set({ pulse: performance.now() })` makes particles beat.

- [ ] **Step 1: Create `components/scene/palettes.js`**

```js
export const palettes = {
  dark: { colorA: "#7c5cff", colorB: "#22d3ee", opacity: 0.9, size: 26, additive: true, bloom: true },
  light: { colorA: "#1e1b4b", colorB: "#f97316", opacity: 0.75, size: 22, additive: false, bloom: false },
};

export function getPalette(theme) {
  return theme === "light" ? palettes.light : palettes.dark;
}
```

- [ ] **Step 2: Create `components/scene/shaders.js`**

```js
export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uAssemble;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uBeat;
  uniform vec3 uPointer;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aScatter;
  attribute float aRand;
  varying float vGlow;
  varying float vRand;

  void main() {
    vec3 p = mix(aFrom, aTo, smoothstep(0.0, 1.0, uMorph));
    p += 0.04 * vec3(
      sin(uTime * 0.8 + aRand * 40.0),
      cos(uTime * 0.7 + aRand * 30.0),
      sin(uTime * 0.6 + aRand * 20.0)
    );
    p = mix(aScatter, p, smoothstep(0.0, 1.0, uAssemble));
    p *= 1.0 + uBeat * 0.15;

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec2 dir = world.xy - uPointer.xy;
    float influence = smoothstep(1.2, 0.0, length(dir));
    world.xy += normalize(dir + 1e-5) * influence * 0.35;

    vGlow = influence + uBeat * 0.5;
    vRand = aRand;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0 - length(p) * 3.0);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aRand) * (1.0 + influence * 1.5 + pulse * 0.25) / -mv.z;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vGlow;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColorA, uColorB, vRand) + vGlow * 0.6;
    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;
```

- [ ] **Step 3: Create `components/scene/Particles.jsx`**

```jsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildShapes } from "./shapes";
import { vertexShader, fragmentShader } from "./shaders";
import { sceneStore } from "@/lib/scene-store";

const DEFAULT_SEQUENCE = ["brain"];

export default function Particles({ count, palette, reducedMotion }) {
  const points = useRef(null);
  const invalidate = useThree((s) => s.invalidate);
  const shapes = useMemo(() => buildShapes(count), [count]);

  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes.brain.slice(), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(shapes.brain.slice(), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(shapes.brain.slice(), 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(shapes.scatter, 3));
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uAssemble: { value: reducedMotion ? 1 : 0 },
        uSize: { value: 24 },
        uPixelRatio: { value: 1 },
        uBeat: { value: 0 },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uOpacity: { value: 1 },
      },
    });
    return { geometry: g, material: m };
  }, [shapes, count, reducedMotion]);

  useEffect(() => {
    const u = material.uniforms;
    u.uColorA.value.set(palette.colorA);
    u.uColorB.value.set(palette.colorB);
    u.uOpacity.value = palette.opacity;
    u.uSize.value = palette.size;
    material.blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.needsUpdate = true;
    invalidate();
  }, [palette, material, invalidate]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useEffect(() => (reducedMotion ? sceneStore.subscribe(() => invalidate()) : undefined), [reducedMotion, invalidate]);

  const current = useRef({ progress: 0, from: "brain", to: "brain", pulse: 0, beat: 0 });

  useFrame((state, delta) => {
    const s = sceneStore.get();
    const u = material.uniforms;
    const c = current.current;
    const seq = s.sequence.length ? s.sequence : DEFAULT_SEQUENCE;

    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
    c.progress += (Math.min(s.progress, seq.length - 1) - c.progress) * ease;

    let from;
    let to;
    let morph;
    if (s.override) {
      from = to = s.override;
      morph = 0;
    } else {
      const f = Math.floor(c.progress);
      from = seq[f];
      to = seq[Math.min(f + 1, seq.length - 1)];
      morph = c.progress - f;
    }

    if (from !== c.from || to !== c.to) {
      geometry.attributes.aFrom.array.set(shapes[from]);
      geometry.attributes.aTo.array.set(shapes[to]);
      geometry.attributes.aFrom.needsUpdate = true;
      geometry.attributes.aTo.needsUpdate = true;
      c.from = from;
      c.to = to;
    }

    if (s.pulse !== c.pulse) {
      c.pulse = s.pulse;
      c.beat = 1;
    }
    c.beat *= Math.exp(-delta * 3);

    u.uMorph.value = morph;
    u.uAssemble.value += (s.assemble - u.uAssemble.value) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 2.5));
    u.uBeat.value = c.beat;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uPointer.value.set((state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0);

    if (!reducedMotion) {
      u.uTime.value += delta;
      points.current.rotation.y += delta * 0.05;
    }
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
```

- [ ] **Step 4: Create `components/scene/SceneCanvas.jsx`**

```jsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import Particles from "./Particles";
import { getPalette } from "./palettes";
import { sceneStore } from "@/lib/scene-store";

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const getDimmed = () => sceneStore.get().dimmed;

export default function SceneCanvas() {
  const { resolvedTheme } = useTheme();
  const reducedMotion = !!useReducedMotion();
  const dimmed = useSyncExternalStore(sceneStore.subscribe, getDimmed, () => false);
  const [supported, setSupported] = useState(null);
  const [count, setCount] = useState(8000);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setSupported(hasWebGL());
    setCount(window.innerWidth < 768 ? 3000 : 8000);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (supported === null) return null;
  const palette = getPalette(resolvedTheme);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-[opacity,filter] duration-700"
      style={{ opacity: dimmed ? 0.35 : 1, filter: dimmed ? "blur(6px)" : "none" }}
    >
      {supported ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop={hidden ? "never" : reducedMotion ? "demand" : "always"}
          eventSource={document.body}
          eventPrefix="client"
        >
          <Particles count={count} palette={palette} reducedMotion={reducedMotion} />
          {palette.bloom && (
            <EffectComposer>
              <Bloom intensity={0.9} luminanceThreshold={0.1} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      ) : (
        <div className="scene-fallback absolute inset-0" />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `components/scene/SceneMount.jsx`**

```jsx
"use client";

import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

export default function SceneMount() {
  return <SceneCanvas />;
}
```

- [ ] **Step 6: Create `components/scene/ScrollSceneSync.jsx`**

```jsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sceneStore } from "@/lib/scene-store";
import { computeSceneProgress } from "./progress";

export default function ScrollSceneSync() {
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const els = Array.from(document.querySelectorAll("[data-scene]"));
      if (!els.length) return;
      sceneStore.set({
        sequence: els.map((el) => el.dataset.scene),
        progress: computeSceneProgress(
          els.map((el) => el.getBoundingClientRect()),
          window.innerHeight,
        ),
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
```

- [ ] **Step 7: Create `components/scene/SceneOverride.jsx`**

```jsx
"use client";

import { useEffect } from "react";
import { sceneStore } from "@/lib/scene-store";

export default function SceneOverride({ shape, dimmed = false }) {
  useEffect(() => {
    sceneStore.set({ override: shape, dimmed });
    return () => sceneStore.set({ override: null, dimmed: false });
  }, [shape, dimmed]);
  return null;
}
```

- [ ] **Step 8: Append fallback style to `app/globals.css`**

```css
.scene-fallback {
  background:
    radial-gradient(60% 50% at 70% 30%, color-mix(in oklab, var(--accent) 35%, transparent), transparent),
    radial-gradient(50% 40% at 20% 80%, color-mix(in oklab, var(--accent-2) 25%, transparent), transparent);
}
```

- [ ] **Step 9: Mount in `app/layout.jsx`** — add imports and render scene before `<main>` inside `<Providers>`:

```jsx
import SceneMount from "@/components/scene/SceneMount";
import ScrollSceneSync from "@/components/scene/ScrollSceneSync";
```

```jsx
          <Providers>
            <SceneMount />
            <ScrollSceneSync />
            <main id="main" className="relative z-10">{children}</main>
          </Providers>
```

- [ ] **Step 10: Tag the placeholder hero** — in `app/page.jsx` change the section to `<section id="hero" data-scene="brain" ...>`.

- [ ] **Step 11: Visual verification**

Run: `bun run dev`, open `http://localhost:3000`.
Expected: glowing violet/cyan particle brain behind the name; particles near the cursor push away and brighten; toggling `document.documentElement.classList.toggle('dark')` in devtools switches to ink particles on off-white with no bloom. Console has no errors.

- [ ] **Step 12: Commit**

```bash
git add components/scene app/layout.jsx app/page.jsx app/globals.css
git commit -m "feat: add GPU-morphing 3D particle scene"
```

---

### Task 6: Smooth scroll + shared UI primitives

**Files:**
- Create: `components/providers/SmoothScroll.jsx`, `lib/scroll.js`, `components/ui/Magnetic.jsx`, `components/ui/SplitReveal.jsx`, `components/ui/RotatingWords.jsx`, `components/ui/SpotlightCard.jsx`, `components/ui/TiltCard.jsx`, `components/ui/Marquee.jsx`, `components/ui/Grain.jsx`, `components/ui/ScrollProgress.jsx`, `components/ui/CountUp.jsx`
- Modify: `components/providers/Providers.jsx`, `app/layout.jsx`, `app/globals.css`

**Interfaces:**
- Produces:
  - `scrollToSection(lenis, id) → boolean` (`lenis` from `useLenis()`; may be `undefined`).
  - `<Magnetic strength?>`, `<SplitReveal as? className? delay?>`, `<RotatingWords words className?>`, `<SpotlightCard className?>`, `<TiltCard className?>`, `<Marquee items: string[]>`, `<Grain />`, `<ScrollProgress />`, `<CountUp to: number>`.
  - GSAP plugins registered once in `SmoothScroll.jsx` (`ScrollTrigger`, `SplitText`); other components import `gsap` and plugins and may call `gsap.registerPlugin` again safely.

- [ ] **Step 1: Create `components/providers/SmoothScroll.jsx`**

```jsx
"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export default function SmoothScroll({ children }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reducedMotion]);

  if (reducedMotion) return children;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, anchors: true }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
```

- [ ] **Step 2: Wrap children in `components/providers/Providers.jsx`**

```jsx
"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import SmoothScroll from "./SmoothScroll";

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Create `lib/scroll.js`**

```js
export function scrollToSection(lenis, id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
```

- [ ] **Step 4: Create `components/ui/Magnetic.jsx`**

```jsx
"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/cn";

const spring = { stiffness: 200, damping: 15, mass: 0.4 };

export default function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
      data-cursor="magnetic"
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5: Create `components/ui/SplitReveal.jsx`**

```jsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, useGSAP);

export default function SplitReveal({ as: Tag = "span", className, delay = 0, children }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const introPending = !document.documentElement.dataset.introSeen;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(ref.current, {
          type: "chars",
          mask: "chars",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 110,
              duration: 1,
              ease: "expo.out",
              stagger: 0.025,
              delay: delay + (introPending ? 1.6 : 0.1),
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 6: Create `components/ui/RotatingWords.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function RotatingWords({ words, className, interval = 2200 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
```

- [ ] **Step 7: Create `components/ui/SpotlightCard.jsx`**

```jsx
"use client";

import { cn } from "@/lib/cn";

export default function SpotlightCard({ className, children, as: Tag = "div", ...props }) {
  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <Tag onPointerMove={onPointerMove} className={cn("spotlight glass relative overflow-hidden", className)} {...props}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 8: Create `components/ui/TiltCard.jsx`**

```jsx
"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/cn";

export default function TiltCard({ className, children }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-10, 10]), { stiffness: 150, damping: 15 });

  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("glass overflow-hidden", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 9: Create `components/ui/Marquee.jsx`**

```jsx
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
```

- [ ] **Step 10: Create `components/ui/Grain.jsx`**

```jsx
const noise =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.06] mix-blend-overlay"
      style={{ backgroundImage: noise }}
    />
  );
}
```

- [ ] **Step 11: Create `components/ui/ScrollProgress.jsx`**

```jsx
"use client";

import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-linear-to-r from-accent to-accent-2"
    />
  );
}
```

- [ ] **Step 12: Create `components/ui/CountUp.jsx`**

```jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

export default function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value}</span>;
}
```

- [ ] **Step 13: Append to `app/globals.css`**

```css
.spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  background: radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%);
}
.spotlight:hover::before {
  opacity: 1;
}

.marquee {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
.marquee-track {
  animation: marquee 40s linear infinite;
}
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
```

- [ ] **Step 14: Mount global UI in `app/layout.jsx`** — import and render after `<main>` inside `<Providers>`:

```jsx
import Grain from "@/components/ui/Grain";
import ScrollProgress from "@/components/ui/ScrollProgress";
```

```jsx
            <main id="main" className="relative z-10">{children}</main>
            <ScrollProgress />
            <Grain />
```

- [ ] **Step 15: Verify**

Run: `bun run build`
Expected: succeeds. Run `bun run dev` and confirm scrolling is smooth and the progress bar fills (add temporary `min-h-[300vh]` to the hero to test, then remove it).

- [ ] **Step 16: Commit**

```bash
git add components/providers components/ui lib/scroll.js app/layout.jsx app/globals.css
git commit -m "feat: add Lenis smooth scroll and shared motion UI primitives"
```

---

### Task 7: Navigation, theme toggle, footer

**Files:**
- Create: `lib/command-palette-events.js`, `components/ui/ThemeToggle.jsx`, `components/ui/Nav.jsx`, `components/ui/LocalTime.jsx`, `components/ui/Footer.jsx`
- Modify: `app/layout.jsx`
- Test: `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `scrollToSection` (Task 6), `site` (Task 1).
- Produces: `OPEN_COMMAND_PALETTE` event name and `openCommandPalette()`; `NAV_SECTIONS` array `[{ id, label }]` exported from `Nav.jsx` (reused by palette in Task 14).

- [ ] **Step 1: Create `lib/command-palette-events.js`**

```js
export const OPEN_COMMAND_PALETTE = "open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE));
}
```

- [ ] **Step 2: Create `components/ui/ThemeToggle.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-9 place-items-center rounded-full transition-colors hover:bg-card"
    >
      {mounted && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {dark ? (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 3: Create `components/ui/Nav.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import ThemeToggle from "./ThemeToggle";
import { scrollToSection } from "@/lib/scroll";
import { openCommandPalette } from "@/lib/command-palette-events";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Journey" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 120);
  });

  useEffect(() => {
    if (!isHome) return setActive(null);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const onNav = (e, id) => {
    if (isHome && scrollToSection(lenis, id)) e.preventDefault();
  };

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav aria-label="Primary" className="glass flex items-center gap-1 rounded-full px-2 py-1.5 shadow-lg shadow-black/5">
        <Link href="/" className="rounded-full px-3 py-1.5 font-display font-semibold">
          {site.name.split(" ")[0]}
          <span className="text-accent">.</span>
        </Link>
        <ul className="hidden items-center md:flex">
          {NAV_SECTIONS.map(({ id, label }) => (
            <li key={id} className="relative">
              <a
                href={isHome ? `#${id}` : `/#${id}`}
                onClick={(e) => onNav(e, id)}
                aria-current={active === id ? "true" : undefined}
                className={cn("relative z-10 block rounded-full px-3 py-1.5 text-sm transition-colors", active === id ? "text-bg" : "text-muted hover:text-fg")}
              >
                {label}
              </a>
              {active === id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 35 }} />
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={openCommandPalette}
          className="ml-1 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted hover:text-fg"
          aria-label="Open command menu"
        >
          <span className="md:hidden">Menu</span>
          <kbd className="hidden rounded border border-line px-1.5 font-mono text-xs md:inline">Ctrl K</kbd>
        </button>
        <ThemeToggle />
      </nav>
    </motion.header>
  );
}
```

- [ ] **Step 4: Create `components/ui/LocalTime.jsx`**

```jsx
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
```

- [ ] **Step 5: Create `components/ui/Footer.jsx`**

```jsx
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
```

- [ ] **Step 6: Mount in `app/layout.jsx`** — import `Nav` and `Footer`; render `<Nav />` before `<main>` and `<Footer />` after it:

```jsx
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
```

```jsx
            <SceneMount />
            <ScrollSceneSync />
            <Nav />
            <main id="main" className="relative z-10">{children}</main>
            <Footer />
            <ScrollProgress />
            <Grain />
```

- [ ] **Step 7: Add e2e test** — append to `tests/e2e/home.spec.js`:

```js
test("theme toggle switches the html class", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(html).toHaveClass(/light/);
});
```

- [ ] **Step 8: Run**

Run: `bun run test:e2e`
Expected: 2 passed.

- [ ] **Step 9: Commit**

```bash
git add lib/command-palette-events.js components/ui app/layout.jsx tests/e2e/home.spec.js
git commit -m "feat: add floating nav, theme toggle and footer"
```

---

### Task 8: Hero + About sections

**Files:**
- Create: `components/sections/Hero.jsx`, `components/sections/About.jsx`
- Modify: `app/page.jsx`
- Test: `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `Magnetic`, `SplitReveal`, `RotatingWords`, `TiltCard` (Task 6); `site`.
- Produces: `#hero[data-scene=brain]`, `#about[data-scene=network]` with `data-section`; About words have `data-word`.

- [ ] **Step 1: Create `components/sections/Hero.jsx`**

```jsx
import Magnetic from "@/components/ui/Magnetic";
import SplitReveal from "@/components/ui/SplitReveal";
import RotatingWords from "@/components/ui/RotatingWords";
import { site } from "@/content/site";

export default function Hero() {
  return (
    <section id="hero" data-section data-scene="brain" className="relative flex min-h-svh flex-col justify-center px-6 pt-24 md:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">{site.name} — {site.location}</p>
        <h1 className="mt-6 font-display text-[clamp(3.2rem,11vw,10rem)] leading-[0.9] font-semibold tracking-tight">
          <SplitReveal className="block">Developer.</SplitReveal>
          <SplitReveal className="block text-accent" delay={0.15}>
            Explorer.
          </SplitReveal>
          <SplitReveal className="block" delay={0.3}>Gamer.</SplitReveal>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted md:text-xl">
          I&apos;m an <RotatingWords words={site.roles} className="font-medium text-fg" /> building products at the
          intersection of AI and the web.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Magnetic>
            <a href="#projects" className="btn-primary">View work</a>
          </Magnetic>
          <Magnetic>
            <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost">Resume ↗</a>
          </Magnetic>
        </div>
      </div>
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">Scroll ↓</p>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/sections/About.jsx`**

```jsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TiltCard from "@/components/ui/TiltCard";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = root.current.querySelectorAll("[data-word]");
        gsap.set(words, { opacity: 0.12 });
        gsap.to(words, {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: { trigger: root.current.querySelector("[data-pin]"), start: "top top", end: "+=180%", pin: true, scrub: 0.5 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} data-section data-scene="network" className="relative">
      <div data-pin className="flex min-h-svh items-center px-6 md:px-12">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-[1fr_320px]">
          <div>
            <p className="eyebrow">01 — About</p>
            <p className="mt-6 font-display text-3xl leading-tight md:text-5xl">
              {site.about.headline.split(" ").map((w, i) => (
                <span key={i} data-word className="mr-[0.25em] inline-block">{w}</span>
              ))}
            </p>
          </div>
          <TiltCard className="aspect-[4/5] w-full max-w-xs justify-self-center">
            <Image src={site.avatar} alt={`Portrait of ${site.name}`} width={320} height={400} unoptimized className="size-full object-cover" />
          </TiltCard>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-6 px-6 pb-32 text-lg text-muted md:text-xl">
        {site.about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Replace `app/page.jsx`**

```jsx
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
    </>
  );
}
```

- [ ] **Step 4: Update e2e** — replace the "home renders the hero" test in `tests/e2e/home.spec.js`:

```js
test("home renders hero and about", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Developer.");
  await expect(page.locator("#about")).toBeAttached();
  await expect(page.locator("#about [data-word]").first()).toBeAttached();
});
```

- [ ] **Step 5: Run**

Run: `bun run test:e2e`
Expected: all passed. Manually: hero letters rise in; scrolling pins About and lights words up one by one while the particle brain morphs into the network.

- [ ] **Step 6: Commit**

```bash
git add components/sections app/page.jsx tests/e2e/home.spec.js
git commit -m "feat: add hero and pinned about sections"
```

---

### Task 9: Skills bento + Projects horizontal rail

**Files:**
- Create: `components/sections/Skills.jsx`, `components/sections/ProjectCard.jsx`, `components/sections/Projects.jsx`
- Modify: `app/page.jsx`
- Test: `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `SpotlightCard`, `Marquee` (Task 6); `site.skills`, `site.projects`.
- Produces: `#skills[data-scene=rings]`, `#projects[data-scene=grid]`; project cards are `next-view-transitions` `Link`s to `/projects/{slug}` with `data-cursor="view"` and an image wrapper styled `viewTransitionName: project-{slug}` (Task 12 reuses the same name).

- [ ] **Step 1: Create `components/sections/Skills.jsx`**

```jsx
import SpotlightCard from "@/components/ui/SpotlightCard";
import Marquee from "@/components/ui/Marquee";
import { site } from "@/content/site";

const spans = ["md:col-span-2", "", "", "md:col-span-2"];

export default function Skills() {
  return (
    <section id="skills" data-section data-scene="rings" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <p className="eyebrow">02 — Toolkit</p>
        <h2 className="section-title">What I work with</h2>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {site.skills.map((s, i) => (
            <SpotlightCard key={s.group} className={`p-8 ${spans[i] ?? ""}`}>
              <h3 className="font-mono text-sm tracking-widest text-accent uppercase">{s.group}</h3>
              <ul className="mt-6 flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <li key={item} className="rounded-full border border-line px-4 py-2 text-sm">{item}</li>
                ))}
              </ul>
            </SpotlightCard>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <Marquee items={site.skills.flatMap((s) => s.items)} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/sections/ProjectCard.jsx`**

```jsx
import Image from "next/image";
import { Link } from "next-view-transitions";

export default function ProjectCard({ project, index }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-cursor="view"
      className="group block w-[80vw] shrink-0 snap-start md:w-[42vw] lg:w-[36vw]"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-card"
        style={{ viewTransitionName: `project-${project.slug}` }}
      >
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          fill
          sizes="(min-width: 1024px) 36vw, (min-width: 768px) 42vw, 80vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl">{project.title}</h3>
        <span className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.slice(0, 4).map((t) => (
          <li key={t} className="chip">{t}</li>
        ))}
      </ul>
    </Link>
  );
}
```

- [ ] **Step 3: Create `components/sections/Projects.jsx`**

```jsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProjectCard from "./ProjectCard";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Projects() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current.querySelector("[data-pin]"),
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="projects" ref={root} data-section data-scene="grid" className="relative">
      <div data-pin className="flex min-h-svh flex-col justify-center overflow-hidden py-24">
        <div className="px-6 md:px-12">
          <p className="eyebrow">03 — Selected work</p>
          <h2 className="section-title">Things I&apos;ve built</h2>
        </div>
        <div
          ref={track}
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 md:px-12 md:motion-safe:w-max md:motion-safe:overflow-visible"
        >
          {site.projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add to `app/page.jsx`**

```jsx
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
    </>
  );
}
```

- [ ] **Step 5: Add e2e test** — append:

```js
test("projects rail lists every project with a detail link", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('#projects a[href^="/projects/"]');
  await expect(links).toHaveCount(8);
  await expect(links.first()).toHaveAttribute("href", "/projects/finguru");
});
```

- [ ] **Step 6: Run**

Run: `bun run test:e2e`
Expected: all passed. Manually at ≥768px: the rail pins and slides horizontally; particles form a grid. Below 768px: native horizontal swipe with snap.

- [ ] **Step 7: Commit**

```bash
git add components/sections app/page.jsx tests/e2e/home.spec.js
git commit -m "feat: add skills bento and horizontal projects rail"
```

---

### Task 10: Experience timeline + GitHub section

**Files:**
- Create: `components/sections/Experience.jsx`, `components/sections/GitHub.jsx`
- Modify: `app/page.jsx`
- Test: `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `getLatestRepos`, `languageColor` (Task 3); `SpotlightCard`, `CountUp` (Task 6).
- Produces: `#experience[data-scene=helix]`, `#github[data-scene=galaxy]` (GitHub renders nothing when the API returns no repos).

- [ ] **Step 1: Create `components/sections/Experience.jsx`**

```jsx
"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { site } from "@/content/site";

export default function Experience() {
  const list = useRef(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start center", "end center"] });

  return (
    <section id="experience" data-section data-scene="helix" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <p className="eyebrow">04 — Journey</p>
        <h2 className="section-title">Experience & education</h2>
        <div ref={list} className="relative mt-16">
          <div className="absolute top-0 left-3 h-full w-px bg-line md:left-1/2">
            <motion.div style={{ scaleY: scrollYProgress }} className="size-full origin-top bg-linear-to-b from-accent to-accent-2" />
          </div>
          <ol className="space-y-16">
            {site.experience.map((e, i) => (
              <motion.li
                key={e.title}
                initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative pl-12 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"}`}
              >
                <span
                  className={`absolute top-2 left-[7px] size-3 rounded-full bg-accent ring-4 ring-bg ${i % 2 ? "md:-left-1.5" : "md:right-[-6px] md:left-auto"}`}
                  aria-hidden
                />
                <p className="font-mono text-sm text-accent">{e.year}</p>
                <h3 className="mt-1 font-display text-2xl">{e.title}</h3>
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:underline">{e.org}</a>
                ) : (
                  <p className="text-muted">{e.org}</p>
                )}
                <p className="mt-3 text-muted">{e.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/sections/GitHub.jsx`**

```jsx
import SpotlightCard from "@/components/ui/SpotlightCard";
import CountUp from "@/components/ui/CountUp";
import { getLatestRepos, languageColor } from "@/lib/github";
import { site } from "@/content/site";

export default async function GitHub() {
  const repos = await getLatestRepos({ username: site.githubUsername, token: process.env.GITHUB_AUTH_TOKEN });
  if (!repos.length) return null;

  const stars = repos.reduce((sum, r) => sum + r.stars, 0);
  const languages = new Set(repos.map((r) => r.language).filter(Boolean)).size;
  const stats = [
    { label: "Recent repos", value: repos.length },
    { label: "Stars", value: stars },
    { label: "Languages", value: languages },
  ];

  return (
    <section id="github" data-section data-scene="galaxy" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">05 — Latest code</p>
            <h2 className="section-title">Fresh from GitHub</h2>
          </div>
          <dl className="flex gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-mono text-xs text-muted uppercase">{s.label}</dt>
                <dd className="font-display text-4xl"><CountUp to={s.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((r) => (
            <li key={r.id}>
              <SpotlightCard as="a" href={r.url} target="_blank" rel="noreferrer" className="flex h-full flex-col p-6">
                <h3 className="font-display text-xl">{r.name}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{r.description ?? "No description yet."}</p>
                <div className="mt-6 flex items-center gap-4 font-mono text-xs text-muted">
                  {r.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: languageColor(r.language) }} />
                      {r.language}
                    </span>
                  )}
                  <span>★ {r.stars}</span>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update `app/page.jsx`**

```jsx
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import GitHub from "@/components/sections/GitHub";

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <GitHub />
    </>
  );
}
```

- [ ] **Step 4: Add e2e test** — append:

```js
test("experience timeline lists entries", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#experience li")).toHaveCount(4);
});
```

- [ ] **Step 5: Run**

Run: `bun run test:e2e`
Expected: all passed. Manually: the timeline line draws as you scroll; GitHub cards show real repos (or the section is absent with no token / rate limit).

- [ ] **Step 6: Commit**

```bash
git add components/sections app/page.jsx tests/e2e/home.spec.js
git commit -m "feat: add experience timeline and GitHub section"
```

---

### Task 11: Contact section

**Files:**
- Create: `components/sections/Contact.jsx`
- Modify: `app/page.jsx`
- Test: `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `sendContact` (Task 2), `sceneStore` (Task 4), `Magnetic` (Task 6).
- Produces: `#contact[data-scene=orb]`; form fields named `name`, `email`, `message`, honeypot `website`; field errors render as `<p id="{field}-error">`.

- [ ] **Step 1: Create `components/sections/Contact.jsx`**

```jsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { sendContact } from "@/app/actions/contact";
import Magnetic from "@/components/ui/Magnetic";
import { sceneStore } from "@/lib/scene-store";
import { site } from "@/content/site";

const initialState = { status: "idle" };

const labels = { idle: "Send message", sending: "Sending…", success: "Sent ✓", error: "Try again" };

function Field({ name, label, type = "text", error, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="relative">
      <Tag
        id={name}
        name={name}
        type={textarea ? undefined : type}
        rows={textarea ? 5 : undefined}
        placeholder=" "
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="peer w-full resize-none rounded-2xl border border-line bg-card px-5 pt-7 pb-3 outline-none transition-colors focus:border-accent"
      />
      <label
        htmlFor={name}
        className="pointer-events-none absolute top-2 left-5 font-mono text-xs text-muted transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
      >
        {label}
      </label>
      {error && <p id={`${name}-error`} className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const [state, formAction, pending] = useActionState(sendContact, initialState);
  const form = useRef(null);

  useEffect(() => {
    if (state.status === "success") {
      sceneStore.set({ pulse: performance.now() });
      form.current?.reset();
    }
  }, [state]);

  const status = pending ? "sending" : state.status;

  return (
    <section id="contact" data-section data-scene="orb" className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:px-12">
        <div>
          <p className="eyebrow">06 — Contact</p>
          <h2 className="mt-4 font-display text-6xl leading-[0.95] font-semibold tracking-tight md:text-8xl">
            Let&apos;s build <span className="text-accent">something</span>.
          </h2>
          <p className="mt-6 max-w-md text-lg text-muted">
            Have an idea, a role or just want to say hi? My inbox is always open.
          </p>
          <a href={`mailto:${site.email}`} className="mt-8 inline-block font-display text-xl underline-offset-8 hover:underline">
            {site.email}
          </a>
          <ul className="mt-10 flex flex-wrap gap-3">
            {site.socials.map((s) => (
              <li key={s.label}>
                <Magnetic>
                  <a href={s.href} target="_blank" rel="noreferrer" className="btn-ghost px-5 py-2.5 text-sm">{s.label}</a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>

        <form ref={form} action={formAction} noValidate className="glass flex flex-col gap-5 p-6 md:p-8">
          <Field name="name" label="Your name" error={state.errors?.name?.[0]} />
          <Field name="email" label="Email" type="email" error={state.errors?.email?.[0]} />
          <Field name="message" label="Message" textarea error={state.errors?.message?.[0]} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          <button type="submit" disabled={pending} className="btn-primary justify-center overflow-hidden disabled:opacity-70">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {labels[status]}
              </motion.span>
            </AnimatePresence>
          </button>

          <p role="status" aria-live="polite" className="min-h-6 text-sm text-muted">
            {state.status === "success" && "Thanks! I'll get back to you soon."}
            {state.status === "error" && state.message}
            {state.status === "error" && !state.errors && (
              <> <a className="underline" href={`mailto:${site.email}`}>Email me directly</a>.</>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `<Contact />` to `app/page.jsx`** after `<GitHub />`, with `import Contact from "@/components/sections/Contact";`.

- [ ] **Step 3: Add e2e test** — append:

```js
test("contact form shows server validation errors", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByLabel("Your name").fill("A");
  await page.getByLabel("Email").fill("bad");
  await page.getByLabel("Message").fill("short");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter a valid email")).toBeVisible();
  await expect(page.getByText("Please enter your name")).toBeVisible();
});
```

- [ ] **Step 4: Run**

Run: `bun run test:e2e`
Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add components/sections/Contact.jsx app/page.jsx tests/e2e/home.spec.js
git commit -m "feat: add animated contact form wired to server action"
```

---

### Task 12: Project detail pages + 404

**Files:**
- Create: `app/projects/[slug]/page.jsx`, `app/not-found.jsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/projects.spec.js`

**Interfaces:**
- Consumes: `getProject`, `getNextProject`, `site` (Task 1); `SceneOverride` (Task 5); view-transition name `project-{slug}` (Task 9).

- [ ] **Step 1: Write the failing e2e `tests/e2e/projects.spec.js`**

```js
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
});

test("project page renders details and next link", async ({ page }) => {
  await page.goto("/projects/finguru");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FinGuru");
  await expect(page.getByRole("link", { name: /View on GitHub/ })).toHaveAttribute("href", /github\.com/);
  await expect(page.getByRole("link", { name: /Next project/ })).toHaveAttribute("href", "/projects/cashcraft");
});

test("unknown project returns 404", async ({ page }) => {
  const res = await page.goto("/projects/does-not-exist");
  expect(res.status()).toBe(404);
  await expect(page.getByText("Lost in the cosmos")).toBeVisible();
});

test("clicking a project card navigates to its page", async ({ page }) => {
  await page.goto("/");
  await page.locator('#projects a[href="/projects/cashcraft"]').click();
  await expect(page).toHaveURL(/\/projects\/cashcraft$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CashCraft");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun run test:e2e tests/e2e/projects.spec.js`
Expected: FAIL — 404 for `/projects/finguru`.

- [ ] **Step 3: Create `app/projects/[slug]/page.jsx`**

```jsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import SceneOverride from "@/components/scene/SceneOverride";
import { getNextProject, getProject, site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(slug);

  return (
    <article className="mx-auto max-w-6xl px-6 pt-32 pb-24 md:px-12">
      <SceneOverride shape="orb" dimmed />
      <Link href="/#projects" className="font-mono text-sm text-muted hover:text-fg">← All work</Link>
      <h1 className="mt-6 font-display text-5xl leading-none font-semibold tracking-tight md:text-8xl">{project.title}</h1>
      <p className="mt-6 max-w-2xl text-xl text-muted">{project.summary}</p>

      <div
        className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-card"
        style={{ viewTransitionName: `project-${project.slug}` }}
      >
        <Image src={project.image} alt={`${project.title} screenshot`} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="eyebrow">Tech</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li key={t} className="chip">{t}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={project.repo} target="_blank" rel="noreferrer" className="btn-primary">View on GitHub ↗</a>
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" className="btn-ghost">Live demo ↗</a>
            )}
          </div>
        </div>
        <div>
          <h2 className="eyebrow">Highlights</h2>
          <ul className="mt-4 space-y-4 text-lg">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <span className="text-accent">✦</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link href={`/projects/${next.slug}`} className="group mt-24 block border-t border-line pt-10">
        <span className="eyebrow">Next project</span>
        <span className="mt-3 block font-display text-4xl transition-colors group-hover:text-accent md:text-6xl">{next.title} →</span>
      </Link>
    </article>
  );
}
```

- [ ] **Step 4: Create `app/not-found.jsx`**

```jsx
import Link from "next/link";
import SceneOverride from "@/components/scene/SceneOverride";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <SceneOverride shape="scatter" dimmed />
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-4 font-display text-6xl font-semibold md:text-8xl">Lost in the cosmos</h1>
      <p className="mt-4 text-muted">This page drifted out of orbit.</p>
      <Link href="/" className="btn-primary mt-10">Back home</Link>
    </section>
  );
}
```

- [ ] **Step 5: Append view-transition timing to `app/globals.css`**

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.45s;
}
::view-transition-group(*) {
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 6: Run**

Run: `bun run test:e2e`
Expected: all passed. Manually in Chrome: clicking a card morphs its image into the project hero.

- [ ] **Step 7: Commit**

```bash
git add app/projects app/not-found.jsx app/globals.css tests/e2e/projects.spec.js
git commit -m "feat: add project detail pages with view transitions and 404"
```

---

### Task 13: Custom magnetic cursor

**Files:**
- Create: `components/ui/Cursor.jsx`
- Modify: `app/layout.jsx`, `app/globals.css`

**Interfaces:**
- Consumes: `data-cursor="view" | "magnetic"` attributes (Tasks 6, 9).

- [ ] **Step 1: Create `components/ui/Cursor.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const sizes = { default: 32, link: 48, magnetic: 64, view: 96 };

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState("default");
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e) => {
      const target = e.target.closest?.("[data-cursor]");
      const interactive = e.target.closest?.("a, button, [role='button'], input, textarea, select, label");
      setVariant(target ? target.dataset.cursor : interactive ? "link" : "default");
    };
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = sizes[variant] ?? sizes.default;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.div
          animate={{ width: size, height: size, backgroundColor: variant === "view" ? "#ffffff" : "rgba(255,255,255,0)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white"
        >
          {variant === "view" && <span className="font-mono text-xs font-bold text-black">View</span>}
        </motion.div>
      </motion.div>
      <motion.div style={{ x, y }} className="absolute top-0 left-0">
        <div className={`size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${variant === "view" ? "opacity-0" : ""}`} />
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Append to `app/globals.css`**

```css
html.custom-cursor,
html.custom-cursor * {
  cursor: none !important;
}
html.custom-cursor input,
html.custom-cursor textarea {
  cursor: text !important;
}
```

- [ ] **Step 3: Mount in `app/layout.jsx`** — `import Cursor from "@/components/ui/Cursor";` and render `<Cursor />` after `<Grain />`.

- [ ] **Step 4: Verify**

Run: `bun run dev`. With a mouse: dot + trailing ring; ring grows over links, becomes a filled "View" bubble over project cards, swells over magnetic buttons. Devtools device emulation (touch): no custom cursor, native cursor intact.
Run: `bun run test:e2e`
Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Cursor.jsx app/layout.jsx app/globals.css
git commit -m "feat: add custom morphing cursor for fine pointers"
```

---

### Task 14: Command palette (Ctrl/⌘+K)

**Files:**
- Create: `components/ui/CommandPalette.jsx`
- Modify: `app/layout.jsx`
- Test: `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `OPEN_COMMAND_PALETTE` (Task 7), `NAV_SECTIONS` (Task 7), `scrollToSection` (Task 6), `site`.

- [ ] **Step 1: Write the failing e2e** — append to `tests/e2e/home.spec.js`:

```js
test("Ctrl+K palette jumps to a section", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+KeyK");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.type("Journey");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#experience")).toBeInViewport();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun run test:e2e -g "palette"`
Expected: FAIL — dialog not visible.

- [ ] **Step 3: Create `components/ui/CommandPalette.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useLenis } from "lenis/react";
import { NAV_SECTIONS } from "./Nav";
import { OPEN_COMMAND_PALETTE } from "@/lib/command-palette-events";
import { scrollToSection } from "@/lib/scroll";
import { site } from "@/content/site";

const itemClass =
  "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-fg data-[selected=true]:text-bg";
const groupClass = "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_PALETTE, onOpen);
    };
  }, []);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  const goToSection = (id) => {
    if (pathname === "/") scrollToSection(lenis, id);
    else router.push(`/#${id}`);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
      contentClassName="fixed top-[20vh] left-1/2 z-[120] w-[min(92vw,560px)] -translate-x-1/2 glass bg-bg/90 p-2 shadow-2xl"
    >
      <Command.Input
        placeholder="Jump to, open, toggle…"
        className="w-full border-b border-line bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[50vh] overflow-y-auto p-1">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">No results.</Command.Empty>
        <Command.Group heading="Navigate" className={groupClass}>
          {[{ id: "hero", label: "Home" }, ...NAV_SECTIONS].map((s) => (
            <Command.Item key={s.id} value={`go ${s.label}`} onSelect={run(() => goToSection(s.id))} className={itemClass}>
              {s.label}
              <span className="font-mono text-xs opacity-60">section</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Projects" className={groupClass}>
          {site.projects.map((p) => (
            <Command.Item key={p.slug} value={`project ${p.title}`} onSelect={run(() => router.push(`/projects/${p.slug}`))} className={itemClass}>
              {p.title}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Links" className={groupClass}>
          {[...site.socials, { label: "Resume", href: site.resumeUrl }].map((s) => (
            <Command.Item key={s.label} value={`open ${s.label}`} onSelect={run(() => window.open(s.href, "_blank", "noopener"))} className={itemClass}>
              {s.label}
              <span className="opacity-60">↗</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Actions" className={groupClass}>
          <Command.Item value="toggle theme" onSelect={run(() => setTheme(resolvedTheme === "light" ? "dark" : "light"))} className={itemClass}>
            Toggle theme
          </Command.Item>
          <Command.Item value="copy email" onSelect={run(() => navigator.clipboard?.writeText(site.email))} className={itemClass}>
            Copy email
            <span className="font-mono text-xs opacity-60">{site.email}</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

- [ ] **Step 4: Mount in `app/layout.jsx`** — `import CommandPalette from "@/components/ui/CommandPalette";` and render `<CommandPalette />` after `<Cursor />`.

- [ ] **Step 5: Run**

Run: `bun run test:e2e`
Expected: all passed.

- [ ] **Step 6: Commit**

```bash
git add components/ui/CommandPalette.jsx app/layout.jsx tests/e2e/home.spec.js
git commit -m "feat: add Ctrl+K command palette"
```

---

### Task 15: Intro loader

**Files:**
- Create: `lib/loader-script.js`, `components/ui/Loader.jsx`
- Modify: `app/layout.jsx`, `app/globals.css`
- Test: `tests/e2e/loader.spec.js`

**Interfaces:**
- Consumes: `sceneStore` (`assemble`), `site.name`.
- Produces: `html[data-intro-seen]` attribute once the intro has played this session (read by `SplitReveal` in Task 6); sessionStorage key `intro-seen`.

- [ ] **Step 1: Write the failing e2e `tests/e2e/loader.spec.js`**

```js
import { test, expect } from "@playwright/test";

test("intro loader plays once per session", async ({ page }) => {
  await page.goto("/");
  const loader = page.getByTestId("intro-loader");
  await expect(loader).toBeVisible();
  await expect(loader).toBeHidden({ timeout: 6000 });
  await page.reload();
  await expect(loader).toBeHidden();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun run test:e2e tests/e2e/loader.spec.js`
Expected: FAIL — no element with test id `intro-loader`.

- [ ] **Step 3: Create `lib/loader-script.js`**

```js
export const loaderScript = `try{if(sessionStorage.getItem("intro-seen")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.introSeen="1"}}catch(e){document.documentElement.dataset.introSeen="1"}`;
```

- [ ] **Step 4: Create `components/ui/Loader.jsx`**

```jsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { sceneStore } from "@/lib/scene-store";
import { site } from "@/content/site";

export default function Loader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.introSeen) {
      setDone(true);
      sceneStore.set({ assemble: 1 });
      return;
    }
    sceneStore.set({ assemble: 0 });
    const controls = animate(0, 100, {
      duration: 1.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        try {
          sessionStorage.setItem("intro-seen", "1");
        } catch {}
        setDone(true);
        sceneStore.set({ assemble: 1 });
      },
    });
    return () => controls.stop();
  }, []);

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.dataset.introSeen = "1")}>
      {!done && (
        <motion.div
          data-testid="intro-loader"
          className="intro-loader fixed inset-0 z-[150] flex flex-col items-center justify-center gap-6 bg-bg"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <svg viewBox="0 0 600 120" className="w-[min(80vw,600px)]" aria-label={site.name} role="img">
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="84"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="intro-stroke font-display"
            >
              {site.name}
            </text>
          </svg>
          <span className="font-mono text-sm text-muted tabular-nums">{String(count).padStart(3, "0")}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Append to `app/globals.css`**

```css
html[data-intro-seen] .intro-loader {
  display: none;
}
.intro-stroke {
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  animation: draw 1.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

- [ ] **Step 6: Wire into `app/layout.jsx`** — import both, add a `<head>` with the inline script, and render `<Loader />` first inside `<Providers>`:

```jsx
import Loader from "@/components/ui/Loader";
import { loaderScript } from "@/lib/loader-script";
```

```jsx
      <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
        <head>
          <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
        </head>
        <body className="bg-bg font-sans text-fg antialiased">
          <a href="#main" className="skip-link">Skip to content</a>
          <Providers>
            <Loader />
            <SceneMount />
```

- [ ] **Step 7: Run**

Run: `bun run test:e2e`
Expected: all passed (other specs pre-set `intro-seen`, so they skip the loader).

- [ ] **Step 8: Commit**

```bash
git add lib/loader-script.js components/ui/Loader.jsx app/layout.jsx app/globals.css tests/e2e/loader.spec.js
git commit -m "feat: add once-per-session intro loader"
```

---

### Task 16: SEO — metadata, OG images, sitemap, robots

**Files:**
- Create: `app/opengraph-image.jsx`, `app/projects/[slug]/opengraph-image.jsx`, `app/sitemap.js`, `app/robots.js`
- Modify: `app/layout.jsx`
- Test: `tests/e2e/seo.spec.js`

- [ ] **Step 1: Write the failing e2e `tests/e2e/seo.spec.js`**

```js
import { test, expect } from "@playwright/test";

test("sitemap lists home and projects", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const xml = await res.text();
  expect(xml).toContain("/projects/finguru");
});

test("robots and OG image are served", async ({ request }) => {
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const og = await request.get("/opengraph-image");
  expect(og.headers()["content-type"]).toContain("image/png");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun run test:e2e tests/e2e/seo.spec.js`
Expected: FAIL — 404s.

- [ ] **Step 3: Create `app/opengraph-image.jsx`**

```jsx
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — AI/ML & Full-stack Developer`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "radial-gradient(circle at 70% 30%, #2a1f66 0%, #05060a 60%)",
          color: "#e8eaf2",
        }}
      >
        <div style={{ fontSize: 28, color: "#8a90a6", letterSpacing: 6 }}>PORTFOLIO</div>
        <div style={{ fontSize: 104, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 40, color: "#22d3ee" }}>AI/ML · Full-stack Developer</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Create `app/projects/[slug]/opengraph-image.jsx`**

```jsx
import { ImageResponse } from "next/og";
import { getProject, site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectOgImage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "radial-gradient(circle at 30% 30%, #1d3b4f 0%, #05060a 65%)",
          color: "#e8eaf2",
        }}
      >
        <div style={{ fontSize: 28, color: "#8a90a6", letterSpacing: 6 }}>{site.name.toUpperCase()} · PROJECT</div>
        <div style={{ fontSize: 88, fontWeight: 700 }}>{project?.title ?? "Project"}</div>
        <div style={{ fontSize: 34, color: "#7c5cff" }}>{project?.tech.join(" · ")}</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 5: Create `app/sitemap.js`**

```js
import { site } from "@/content/site";

export default function sitemap() {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, priority: 1 },
    ...site.projects.map((p) => ({ url: `${site.url}/projects/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
```

- [ ] **Step 6: Create `app/robots.js`**

```js
import { site } from "@/content/site";

export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.url}/sitemap.xml` };
}
```

- [ ] **Step 7: Extend `metadata` in `app/layout.jsx`**

```jsx
export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — AI/ML & Full-stack Developer`, template: `%s — ${site.name}` },
  description: site.about.headline,
  openGraph: { type: "website", siteName: site.name, url: site.url },
  twitter: { card: "summary_large_image", creator: "@mihirh21" },
};
```

- [ ] **Step 8: Run**

Run: `bun run test:e2e`
Expected: all passed.

- [ ] **Step 9: Commit**

```bash
git add app/opengraph-image.jsx app/projects/[slug]/opengraph-image.jsx app/sitemap.js app/robots.js app/layout.jsx tests/e2e/seo.spec.js
git commit -m "feat: add OG images, sitemap and robots"
```

---

### Task 17: Analytics + reduced-motion and mobile verification

**Files:**
- Modify: `app/layout.jsx`
- Test: `tests/e2e/a11y.spec.js`

- [ ] **Step 1: Write the e2e `tests/e2e/a11y.spec.js`**

```js
import { test, expect } from "@playwright/test";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("content is fully visible without animation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("intro-loader")).toBeHidden();
    await expect(page.locator("#about [data-word]").first()).toHaveCSS("opacity", "1");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await expect(page.locator('#projects a[href="/projects/finguru"]')).toBeVisible();
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("no horizontal page overflow and menu opens palette", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: "Open command menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test("skip link targets main", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
```

- [ ] **Step 2: Run**

Run: `bun run test:e2e tests/e2e/a11y.spec.js`
Expected: PASS. If the mobile overflow check fails, find the overflowing element with `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth)` in the browser console and add `overflow-x-clip` to its section; re-run.

- [ ] **Step 3: Add analytics** — confirm the export path exists, then wire it:

Run: `bun -e "import('@vercel/analytics/next').then(m => console.log(Object.keys(m)))"`
Expected: prints `[ 'Analytics' ]` (if it fails, use `@vercel/analytics/react`).

In `app/layout.jsx`: `import { Analytics } from "@vercel/analytics/next";` and render `<Analytics />` as the last child of `<body>`.

- [ ] **Step 4: Full verification**

Run: `bun test tests/unit` → all pass.
Run: `bun run build` → succeeds; `/projects/[slug]` shows 8 prerendered paths.
Run: `bun run test:e2e` → all pass.

- [ ] **Step 5: Commit**

```bash
git add app/layout.jsx tests/e2e/a11y.spec.js
git commit -m "feat: add analytics and reduced-motion/mobile coverage"
```

---

### Task 18: Housekeeping — Docker, env example, README

**Files:**
- Modify: `Dockerfile`, `.dockerignore`, `README.md`
- Create: `.env.example`

- [ ] **Step 1: Replace `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun --bun run build

FROM oven/bun:1 AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
USER bun
EXPOSE 3000
CMD ["bun", "--bun", "run", "start"]
```

- [ ] **Step 2: Ensure `.dockerignore` contains** (append missing lines)

```
node_modules
.next
.env
test-results
playwright-report
```

- [ ] **Step 3: Create `.env.example`**

```
# GitHub token (read-only public_repo) for the "Fresh from GitHub" section
GITHUB_AUTH_TOKEN=
# Resend API key for the contact form (https://resend.com)
RESEND_API_KEY=
# Where contact messages are delivered (defaults to content/site.js email)
CONTACT_TO_EMAIL=
# Public site URL for metadata, OG and sitemap
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Replace `README.md`**

````markdown
# Mihir Hadavani — Portfolio

Cinematic portfolio built with Next.js 16 (App Router), React 19, Tailwind CSS 4, React Three Fiber, GSAP, Lenis and Motion. Runs on Bun.

## Develop

```bash
bun install
cp .env.example .env   # fill in tokens
bun run dev
```

## Test

```bash
bun test tests/unit
bunx playwright install chromium
bun run test:e2e
```

## Edit content

All copy, projects, skills and experience live in `content/site.js`.

## Docker

```bash
docker build -t portfolio .
docker run -p 3000:3000 --env-file .env portfolio
```
````

- [ ] **Step 5: Verify the image builds** (skip if Docker is not installed and say so)

Run: `docker build -t portfolio .`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile .dockerignore .env.example README.md
git commit -m "chore: bun-based Dockerfile, env example and README"
```

---

## Self-Review Notes

- **Spec coverage:** stack (T1), architecture/server-client split (T1–T5), 3D scene + shapes + theming (T4–T5), storyline sections 0–7 (T8–T11, T15), project pages + view transitions (T12), nav/palette/cursor/grain/progress (T6, T7, T13, T14), contact action (T2, T11), performance (T5 DPR/count/visibility/fallback, T1 next/image), accessibility (T6 matchMedia, T13 pointer gating, T7 skip link, T17), error handling (T3 `[]`, T10 null section, T12 `dynamicParams=false`, T2/T11 errors + mailto), testing (unit T1–T4, e2e throughout), housekeeping (T1, T18).
- **Type consistency:** `sceneStore` fields (`sequence, progress, override, dimmed, assemble, pulse`) are used identically in T5, T11, T12, T15; `NAV_SECTIONS`/`OPEN_COMMAND_PALETTE` defined in T7 and consumed in T14; `viewTransitionName: project-${slug}` matches in T9/T12.
