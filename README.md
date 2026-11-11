# South Omo Zone portal

Bilingual (English / አማርኛ) website for the South Omo Zone Administration, focused on **investment, agriculture and tourism**.
Built with React, Vite, Tailwind CSS, Framer Motion and Lucide icons.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (hash routing: works on any static host)
```

## Pages
Home (photo slideshow, key facts, leader message + video, sectors, woredas, tourism, notice board) · The Zone (profile and full leader message) ·
Invest (6 sectors, filterable opportunities, investment steps, responsible-investment commitments) · Woredas and a page per woreda ·
Tourism (attractions, live weekly-market calendar, travel etiquette) · Announcements (vacancies and tenders with live deadlines) · Contact · Photo credits.

## Design
- Colours come from the zone emblem (`public/brand/logo.png`): royal blue `#2a55bd` / `#5286fe`, with the emblem's green, red and gold as accents. Tokens are in `tailwind.config.js`.
- Type: Playfair Display (headings), Inter (text), Noto Serif / Sans Ethiopic for Amharic. All fonts are bundled, so nothing loads from Google.

## Updating content
All text lives in `src/data/content.js`, and every field has `en` and `am` versions. `src/api.js` is the only place that reads it, so it can later be pointed at a CMS or API.

| What | Status | Where |
|---|---|---|
| Zone facts, woredas, seats, peoples, heritage, sectors | Researched (see sources) | `content.js` |
| Leader name, photo, video | **Placeholder**: add the photo as `public/images/leader.jpg`, set `leader.photo` and `leader.video` (mp4 or YouTube link) | `content.js` → `leader` |
| Investment opportunities | **Sample**, labelled on the site | `content.js` → `opportunities` |
| Vacancies and tenders | **Sample**, labelled on the site | `content.js` → `announcements` |
| Phone and emails | **Placeholder** | `content.js` → `zone.contact` |
| Seats of Kuraz and Bako Gazer | Not confirmed, so not shown | `content.js` → `woredas` |

## Photos
16 photos from Wikimedia Commons under CC BY / CC BY-SA licences. Authors and licences are in `src/data/credits.json`, shown on the
Photo credits page and on hover. Keep the credits if you keep the photos. To add the zone's own photos, put them in `public/images/` and reference the file name (without `.jpg`).

## Research sources
- [South Omo Zone (Wikipedia)](https://en.wikipedia.org/wiki/South_Omo_Zone): 2023 split from Ari Zone, current eight woredas, Dimeka as capital
- [Hamer (woreda)](https://en.wikipedia.com/wiki/Hamer_(woreda)), [Dimeka](https://en.wikipedia.org/wiki/Dimeka), [Bena Tsemay](https://Www.Wikipedia.org/wiki/Bena_Tsemay): woreda seats
- [Community early-warning paper, South Omo (2025)](https://preparecenter.org/wp-content/uploads/2025/04/Full-Paper-Community-Developed-EWEA-Solutions-in-Ethiopia.pdf): restructuring and agro-pastoral communities
- [Oakland Institute land brief](https://www.oaklandinstitute.org/sites/oaklandinstitute.org/files/Land_Deal_Brief_Ethiopia_Omo_Valley.pdf), [South Omo Investment Area](https://www.celep.info/wp-content/uploads/2013/01/South-Omo-Investment-Area.pdf), [Omo-Kuraz III](https://ethiopianembassy.be/?p=12215): Omo-Kuraz sugar, cotton, land identified for investment
- [Kibish Formation fossils (IUGS)](https://iugs-geoheritage.org/?p=10716), [Omo National Park](https://en.wikipedia.org/wiki/Omo_National_Park): oldest Homo sapiens (about 233,000 years), Mago National Park wildlife
- Tour operator listings ([example](https://gowithguide.com/ethiopia/tour/jinka-5-day-omo-valley-cultural-tour-from-jinka-17408)): market days, access via Jinka, travel season. Market days change, and the site says so.

## Marketing materials (shows the previous design; needs updating)
`npm run marketing` rebuilds everything from the current site (needs ffmpeg and Playwright):

| Output | What |
|---|---|
| `marketing/screenshots/` | 30 screenshots: desktop and iPhone, English (`en-*`) and Amharic (`am-*`) |
| `marketing/output/brochure-en.pdf`, `brochure-am.pdf` | A4 landscape tri-fold, 2 pages (outside + inside), print-ready |
| `marketing/output/brochure-*-outside.png`, `*-inside.png` | brochure previews for social media / email |
| `marketing/output/south-omo-promo.mp4` | 50 s, 1920×1080 promo video (silent; add music or voice-over in any editor) |

Set `SITE_URL=https://real-domain` before running to update the QR code and URLs.
Scripts: `capture.cjs` (screenshots), `brochure.mjs`, `video.mjs` (timeline is in the `<script>` block).
