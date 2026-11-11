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
