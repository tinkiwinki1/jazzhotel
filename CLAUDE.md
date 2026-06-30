# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # astro dev — http://localhost:4321
npm run build    # astro build — emits dist/ via Netlify adapter
npm run preview  # astro preview
npm run check    # astro check — typecheck .astro + .ts + .tsx
```

There is no test suite and no separate lint command — `npm run check` (Astro's TS/JSX checker) is the only static verification.

## Architecture

**Astro 5 SSR + Netlify adapter** (`astro.config.mjs`, `output: 'server'`). Pages render at request time; the API route runs as a Netlify Function. React is used only for interactive islands (charts, form) — Astro components do all static rendering.

**Two-locale i18n by file convention, not middleware.** Default locale is `ru` (no prefix); `en` lives under `/en/`. The two page entry points — `src/pages/index.astro` and `src/pages/en/index.astro` — are nearly identical: they compose the same section components, passing `locale="ru"` or `locale="en"`. There is no shared composition layer; if you add or reorder a section, **edit both pages**.

**All copy lives in `src/i18n/ru.ts` and `src/i18n/en.ts`.** The two files share the same shape (`Dict`). Every section component does `getDict(locale).<sectionKey>` (see `src/i18n/index.ts`). When you add a key to one locale, mirror it in the other or TypeScript will fail.

**Section pattern.** Each file under `src/components/sections/*.astro` takes a `locale` prop, pulls its slice from `getDict`, and renders. Interactive subsections are `.tsx` siblings rendered as Astro islands (e.g., `Financials.astro` wraps `FinancialsHero.tsx`, `Roadmap.astro` wraps `RoadmapShowcase.tsx`). Recharts is forced into SSR-friendly bundling via `vite.ssr.noExternal: ['recharts']` in the Astro config — don't remove that without a replacement.

**Contact details are centralized.** `src/config.ts` exports a `contact` object (phone, WhatsApp, Telegram, email) consumed by the footer, sticky mobile CTA, and form. Change it there, not in components.

**Form submission flow.** `src/components/form/NdaRequestForm.tsx` (React + react-hook-form + zod) POSTs to `src/pages/api/nda-request.ts`. The API:
1. Re-validates the body with zod.
2. Honeypot: silently returns `ok` if `companyWebsite` is non-empty.
3. In-memory IP rate limit, 5 req/hour per IP (resets on cold start — fine for this low-traffic teaser).
4. Sends a Telegram HTML message (with `tel:` and `wa.me/` links) if `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set.
5. Sends two Resend emails (seller notification + locale-aware applicant confirmation) if `RESEND_API_KEY` is set.
6. **Graceful fallback:** with no channels configured, it logs the lead to stdout and still returns `{ ok: true }`. Local dev works with zero env setup.

## Environment

Env vars (`.env` locally; Netlify dashboard in prod — intentionally not in `netlify.toml`):

- `RESEND_API_KEY` — optional; without it, emails are skipped and the lead is logged
- `SELLER_EMAIL`, `FROM_EMAIL` — defaults fall back to `info@aurahomes.ge` / `nda@aurahomes.ge`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — both required to enable Telegram notifications
- `PLAUSIBLE_DOMAIN` — optional analytics
- `FB_CONVERSIONS_API_TOKEN` — optional; enables the server-side Meta `Lead` event (Conversions API) from the NDA API route. Without it, only the browser Pixel fires.
- `FB_PIXEL_ID` — optional override for the CAPI pixel id; defaults to the pixel hardcoded in `Base.astro` (`1716927566157782`).

See `SETUP_NOTIFICATIONS.md` for the Telegram bot setup walkthrough.

## Conventions

- Path alias `@/*` → `src/*` (configured in `tsconfig.json`); use it instead of relative `../../` imports.
- Tailwind uses a custom design palette in `tailwind.config.ts` (`bg-light/dark`, `gold`, `tan-card`, `ink`, `line`, `neg`) plus serif/sans tokens. Stick to these tokens rather than arbitrary hex.
- The site is intentionally `noindex,nofollow` (see `Base.astro` head and `public/robots.txt`). Don't add OG/canonical tweaks that imply public indexing.
- `public/images/hero.jpg`, `pool.jpg`, `room.jpg` are placeholder extractions from the deck — flag if replacing with prod assets.

## Figma MCP rules

The Figma plugin (`figma@claude-plugins-official`) is installed. When the user shares a Figma frame link and asks to port it to the site, follow this flow — do **not** improvise or skip steps.

### Required flow

1. `get_design_context` first for the exact node from the link. If the response is truncated, call `get_metadata` to map the node tree, then re-fetch only the relevant children.
2. `get_screenshot` for visual reference — keep this alongside the structured output during implementation.
3. `get_variable_defs` to pull the actual design tokens (color, spacing, type) used in the selection.
4. Download any image/SVG assets from the MCP `localhost` endpoint into `public/images/`. **Use the localhost source directly** — do not invent placeholders, do not import new icon packages (lucide-react is already available for icons).
5. Translate the MCP output (React + Tailwind) into this project's conventions before writing files (see "Translation rules" below).
6. Run `npm run dev` and visually compare against the Figma screenshot before reporting done.

### Translation rules (MCP output → this codebase)

- The MCP returns React + Tailwind. Most sections here are **Astro** files (`src/components/sections/*.astro`). Convert JSX to Astro: hoist data into the frontmatter, use `{t.foo}` interpolation, drop `className=` → `class=`. Only keep React (`.tsx`) when the section needs interactivity (state, charts, forms) — match the existing split (e.g. `Roadmap.astro` shell + `RoadmapShowcase.tsx` island).
- **Tokens, not hex.** Map Figma color variables to the Tailwind palette in `tailwind.config.ts` (`gold`, `bg-dark`, `ink`, `line-dim`, etc.). If a Figma variable has no equivalent, add it to `tailwind.config.ts` rather than inlining the hex. Same for `fontFamily` (`serif` / `sans`), `maxWidth.content`, and the `eyebrow` letter-spacing token.
- **Never hardcode copy.** All text strings live in `src/i18n/ru.ts` and `src/i18n/en.ts`. When a section changes shape, update both locale files in the same edit — TypeScript will fail the build if the `Dict` shape diverges. If only RU is in the Figma file, add a clearly-marked TODO placeholder for EN and tell the user.
- **Contacts** (phone, WhatsApp, Telegram, email) come from `src/config.ts`. If the design shows new contact channels, extend that file instead of embedding strings.
- **Section composition.** Both `src/pages/index.astro` and `src/pages/en/index.astro` list every section in order. Adding or removing a section means editing both files.

### Scoping & validation

- Break large selections into individual sections — port one section per turn (Hero, then Highlights, etc.). Don't try to consume a whole-page frame in one call: it bloats context and hits Figma rate limits faster.
- After each section is ported, run `npm run check` to catch i18n shape drift and TS errors.
- Free Figma plans cap MCP tool calls at 6/month. Batch reads (one `get_design_context` per section, not per element) and warn the user if a task would obviously blow the budget.
