# Pack Publishing

## Add A Downloadable Pack

The marketplace is currently in `Coming soon` mode. Keep catalog items as
`status: "comingSoon"` until public distribution is approved.

1. Create a pack JSON file:

```text
public/packs/<pack-id>.json
```

2. Add a preview:

```text
public/previews/<pack-id>.svg
```

3. Add a catalog item to:

```text
public/catalog.json
```

4. Run:

```bash
npm run validate
```

5. Preview locally:

```bash
npm run dev
```

## Pack Rules

- `kind` must be `cuerex.templatePack`.
- Every template needs `id`, `name`, and `prompt`.
- Template IDs must be globally unique across all downloadable packs.
- Free packs can expose `packUrl`.
- Paid/high-value packs should not expose prompt bodies. Use `access: "cloud"` and `status: "comingSoon"` until the cloud API exists.

## Current Limitations

- Pack signing is not implemented yet.
- Encrypted local packs are not implemented yet.
- Purchases, login, and cloud application are not implemented yet.
