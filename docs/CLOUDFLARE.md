# Cloudflare Pages

## Recommended Settings

```text
Project name: cuerex-marketplace
Framework preset: None
Build command: empty
Build output directory: public
Custom domain: marketplace.cuerex.ai
```

`public/_headers` is included so Cloudflare Pages will attach CORS headers to `catalog.json` and downloadable pack files.

## Direct Upload

```bash
CLOUDFLARE_ACCOUNT_ID=<account-id> npm run deploy
```

The script runs:

```bash
npx wrangler pages deploy public --project-name=cuerex-marketplace
```

For CI, configure:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

The token needs Pages edit access for the target account.

## Domains

Recommended production domain:

```text
https://marketplace.cuerex.ai
```

The main marketing site can link to the marketplace from:

```text
https://cuerex.ai/marketplace
```

That path can be a redirect or navigation entry. The marketplace itself should remain on the subdomain.
