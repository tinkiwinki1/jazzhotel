# Northern Tbilisi · 4★ Boutique Hotel — investment landing

Bilingual (RU / EN) one-pager built on **Astro 5 + React 18 + Tailwind 3** for a confidential pre-NDA hotel investment teaser.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

## Stack

- **Astro 5** SSR (server output, Node adapter)
- **React 18** islands for charts (Recharts) and form (react-hook-form + zod)
- **Tailwind 3** with custom design tokens (colors, type scale)
- **Resend** for transactional email (optional — logs to console if `RESEND_API_KEY` unset)

## Routes

| URL          | Locale     |
|--------------|------------|
| `/`          | RU (default) |
| `/en/`       | EN         |
| `/api/nda-request` | POST endpoint for the form |

## Where to edit content

All text lives in `src/i18n/ru.ts` and `src/i18n/en.ts`. Both files share the same shape (`Dict` type) so EN must mirror RU keys.

## Where to edit contacts

- Footer contact line — `footer.contact` in both i18n files
- Email destination — `SELLER_EMAIL` in `.env`
- Sender address — `FROM_EMAIL` in `.env` (must be verified in Resend)

## Environment variables (`.env`)

```
RESEND_API_KEY=
SELLER_EMAIL=seller@example.com
FROM_EMAIL=nda@northerntbilisi-hotel.com
PLAUSIBLE_DOMAIN=
```

If `RESEND_API_KEY` is empty the API still returns `{ ok: true }` and prints the request to stdout — useful for local dev.

## Photos

`public/images/` — `hero.jpg` (slide 1), `pool.jpg`, `room.jpg` (slide 3) extracted from the deck. Replace with hi-res versions before go-live.

## Confidentiality

`<meta name="robots" content="noindex,nofollow">` on every page + `public/robots.txt` `Disallow: /`. The site is intended to be linked privately, not crawled.
