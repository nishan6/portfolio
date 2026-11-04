# Nishan On Air

Portfolio for Nishan Abraham Pani, live visuals director. Built with Vite, GSAP, Lenis and Three.js.

## Run it locally

```
npm install
npm run dev
```

## Deploy to Vercel

Push this folder to a GitHub repo, then import the repo at vercel.com/new. Vercel detects Vite automatically (build: `npm run build`, output: `dist`).

## Update content

Everything you'll want to change lives in `src/data.js`:

- `work`: projects shown as feeds
- `gear`: the rack; add items to each unit's `items` list
- `cams`: images used in the multiviewer
- `stats`, `crafts`, `person` (contact details)

Images go in `public/img/`. Drop clips in later by swapping image paths for video.
