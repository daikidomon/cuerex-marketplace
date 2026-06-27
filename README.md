# cuerex Marketplace

Static marketplace for cuerex packs.

Current public state: `Coming soon`.

The first version is a Cloudflare Pages app with a minimal static build step. It publishes:

- `dist/catalog.json` as the marketplace catalog
- `dist/packs/*.json` as downloadable template packs
- `dist/previews/*` as pack previews
- `dist/index.html` as the marketplace UI

## Technical Direction

The marketplace should move toward an `Astro + React` architecture.

Astro should be the base framework for the public marketplace because the public pages need fast static delivery, language-specific URLs, indexable HTML, and simple Cloudflare deployment. Public routes should be generated as localized pages such as `/ja/` and `/en/`.

React should be used inside Astro for interactive UI surfaces:

- marketplace search and filtering
- pack detail panels
- creator application flows
- authenticated upload and management screens
- future admin/review tools

Avoid making the public marketplace a React-only single-page app. A React SPA is useful for app-like screens, but it is weaker for public marketplace concerns such as SEO, static HTML, and clean i18n routing.

Future Cloudflare storage and auth direction:

- D1 stores marketplace metadata, creator records, review state, and upload ownership.
- R2 stores uploaded pack files, preview images, and protected assets.
- Authenticated creator/admin routes should be implemented as dynamic Cloudflare-backed flows while keeping public catalog pages statically renderable where possible.

## Local Development

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:8788
```

## Validation

```bash
npm run validate
```

The validator checks catalog shape, referenced pack files, preview files, and duplicate template IDs.

## Build

```bash
npm run build
```

The build validates the catalog and copies `public/` to `dist/`.

## Deploy

```bash
npm run deploy
```

Cloudflare Pages settings:

```text
Project name: cuerex-marketplace
Build command: npm run build
Build output directory: dist
Custom domain: marketplace.cuerex.ai
```

## Install Flow

The install flow is disabled while the marketplace is in `Coming soon` mode.

After launch, downloadable packs will expose a public pack URL such as:

```text
https://marketplace.cuerex.ai/packs/shorts-growth.json
```

Users paste that URL into cuerex:

```text
辞書/テンプレート -> 編集テンプレート -> URLから追加
```

Paid/high-value packs should use a future cloud application API instead of distributing prompt bodies.
