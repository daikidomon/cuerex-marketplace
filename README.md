# cuerex Marketplace

Static marketplace for cuerex packs.

Current public state: `Coming soon`.

The first version is a Cloudflare Pages app with a minimal static build step. It publishes:

- `dist/catalog.json` as the marketplace catalog
- `dist/packs/*.json` as downloadable template packs
- `dist/previews/*` as pack previews
- `dist/index.html` as the marketplace UI

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
