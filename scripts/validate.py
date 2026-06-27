#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def public_path(relative_path):
    return PUBLIC / str(relative_path).removeprefix("./")


catalog = read_json(PUBLIC / "catalog.json")
require(catalog.get("kind") == "cuerex.marketplaceCatalog", "catalog.kind must be cuerex.marketplaceCatalog")
items = catalog.get("templates")
require(isinstance(items, list), "catalog.templates must be an array")

catalog_ids = set()
template_ids = set()

for item in items:
    item_id = item.get("id")
    require(item_id, "catalog item id is required")
    require(item_id not in catalog_ids, f"duplicate catalog item id: {item_id}")
    catalog_ids.add(item_id)
    require(item.get("status"), f"catalog item status is required: {item_id}")
    require(item.get("license"), f"catalog item license is required: {item_id}")
    require(item.get("name"), f"catalog item name is required: {item_id}")
    require(item.get("description"), f"catalog item description is required: {item_id}")

    preview_url = item.get("previewUrl")
    if preview_url:
        require(public_path(preview_url).is_file(), f"missing preview: {preview_url}")

    if item.get("status") == "available":
        pack_url = item.get("packUrl")
        require(pack_url, f"available item must have packUrl: {item_id}")
        pack = read_json(public_path(pack_url))
        require(pack.get("kind") == "cuerex.templatePack", f"pack.kind must be cuerex.templatePack: {pack_url}")
        templates = pack.get("templates")
        require(isinstance(templates, list), f"pack.templates must be an array: {pack_url}")
        require(len(templates) == item.get("templateCount"), f"templateCount mismatch: {item_id}")
        for template in templates:
            template_id = template.get("id")
            require(template_id, f"template id is required in {pack_url}")
            require(template_id not in template_ids, f"duplicate template id: {template_id}")
            template_ids.add(template_id)
            require(template.get("name"), f"template name is required: {template_id}")
            require(template.get("prompt"), f"template prompt is required: {template_id}")

print(f"validated {len(items)} marketplace items and {len(template_ids)} downloadable templates")
