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
