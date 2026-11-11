# South Omo Zone website (demo)

Bilingual (English / አማርኛ) site: Zone Administrator message (photo, text, video), woreda list and promotion,
per-woreda investment opportunities, and vacancy and tender announcements. All content is **mock data**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## Where to change things
| What | File |
|---|---|
| Logo | replace `public/logo.svg` (or set `LOGO_SRC` in `src/config.js`) |
| Brand colours | the 4 variables at the top of `src/styles.css` |
| Leader photo / text / video | `leader` in `src/data/mock.js` (`video` accepts an mp4 URL or YouTube link) |
| Woredas, opportunities, vacancies, tenders | `src/data/mock.js` (each text field is `{ en, am }`) |
| Real backend | replace function bodies in `src/api.js` with `fetch()` calls; UI already treats data as async |

## Marketing materials
`npm run marketing` rebuilds everything from the current site (needs ffmpeg and Playwright):

| Output | What |
|---|---|
| `marketing/screenshots/` | 30 screenshots: desktop and iPhone, English (`en-*`) and Amharic (`am-*`) |
| `marketing/output/brochure-en.pdf`, `brochure-am.pdf` | A4 landscape tri-fold, 2 pages (outside + inside), print-ready |
| `marketing/output/brochure-*-outside.png`, `*-inside.png` | brochure previews for social media / email |
| `marketing/output/south-omo-promo.mp4` | 50 s, 1920×1080 promo video (silent; add music or voice-over in any editor) |

Set `SITE_URL=https://real-domain` before running to update the QR code and URLs.
Scripts: `capture.cjs` (screenshots), `brochure.mjs`, `video.mjs` (timeline is in the `<script>` block).
