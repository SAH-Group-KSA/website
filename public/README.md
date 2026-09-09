# Public assets (from HTML prototypes)

All media here was extracted from the HTML prototypes in `prototypes/`.
Nothing was redesigned. Existing files are never overwritten.

## Layout

| Path | Contents |
|------|----------|
| `icons/` | Favicon and icon SVGs (exact prototype SVG) |
| `logos/` | Partner + SAH Group logos (paths used by content) |
| `images/backgrounds/` | Section background photos (`hero-media`, `journey-builder-bg`, `method-bg`, `measurement-bg`, `about-media`) |
| `images/founders/` | Founder portraits |
| `og/` | Open Graph share image |
| `fonts/` | Empty — prototypes embed no `@font-face` files |
| `videos/` | Hero / section videos (e.g. `leading-by-listening.m4v`) |

## Inventory

See `asset-manifest.json` for historical SHA-256 hashes and extraction aliases.
Live pages only reference the paths under Layout above (plus `/logos/*` from content JSON).

## Re-extract

```bash
python3 scripts/extract-prototype-assets.py
```

The script never overwrites an existing file with different bytes. Same content is reused; different content gets a hashed sibling filename.
