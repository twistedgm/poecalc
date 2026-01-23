# PoE Calculator

This repository contains a small Vite + React app that calculates PoE requirements for network switches.

## Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build locally: `npm run preview`

## Deployment

This repo includes a GitHub Actions workflow that builds the site and publishes the `dist/` folder to the `gh-pages` branch. GitHub Pages should be configured to serve from the `gh-pages` branch (or the repository Pages settings will detect it automatically).

If you prefer Netlify, Vercel, or another host, you can also deploy the `dist/` output from `npm run build`.

Please create a pull request from `fix/ci-deploy` to `main` to review and merge these changes.
