#!/usr/bin/env python3
"""Extract every asset from SAH HTML prototypes into public/ (never overwrite)."""
from __future__ import annotations

import base64
import hashlib
import json
import re
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PROTOS = sorted((ROOT / "prototypes").glob("*.html"))

for rel in (
    "images",
    "images/backgrounds",
    "images/founders",
    "images/entities",
    "icons",
    "logos",
    "fonts",
    "videos",
    "patterns",
    "svg",
    "decorations",
    "og",
):
    (PUBLIC / rel).mkdir(parents=True, exist_ok=True)

MIME_EXT = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "font/woff2": "woff2",
    "font/woff": "woff",
    "video/mp4": "mp4",
    "video/webm": "webm",
}

SELECTOR_CANONICAL = {
    ".hero-media": "images/backgrounds/hero-media.png",
    ".hero-noise": "patterns/hero-noise.svg",
    ".journey-builder::before": "images/backgrounds/journey-builder-bg.png",
    ".method::before": "images/backgrounds/method-bg.png",
    ".measurement::before": "images/backgrounds/measurement-bg.png",
    ".about-media": "images/backgrounds/about-media.png",
    ".contact::before": "images/backgrounds/contact-bg.png",
}


def sha16(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:16]


def slugify_ascii(text: str, fallback: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:70] if text else fallback


def decode_payload(is_b64: bool, payload: str) -> bytes:
    if is_b64:
        payload = re.sub(r"\s+", "", payload)
        payload += "=" * ((-len(payload)) % 4)
        return base64.b64decode(payload)
    return urllib.parse.unquote_to_bytes(payload)


def extract_data_uri_at(text: str, header_start: int):
    m = re.match(
        r"data:([a-zA-Z0-9.+/-]+)(;charset=[^;,]+)?(;base64)?,",
        text[header_start:],
    )
    if not m:
        return None
    mime = m.group(1).lower()
    is_b64 = bool(m.group(3))
    payload_start = header_start + m.end()

    i = header_start - 1
    while i >= 0 and text[i] in " \t\n\r":
        i -= 1
    opener = text[i] if i >= 0 else ""

    if opener in "\"'":
        end = text.find(opener, payload_start)
        if end < 0:
            end = len(text)
        payload = text[payload_start:end]
        end_index = end
    elif opener == "(":
        end = text.find(")", payload_start)
        if end < 0:
            end = len(text)
        payload = text[payload_start:end]
        end_index = end
    else:
        end = payload_start
        while end < len(text) and text[end] not in "\"') \t\n\r":
            end += 1
        payload = text[payload_start:end]
        end_index = end

    try:
        raw = decode_payload(is_b64, payload)
    except Exception:
        return None
    if len(raw) < 8:
        return None
    return mime, raw, end_index


def write_never_replace(rel: str, raw: bytes) -> Path:
    path = PUBLIC / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    digest = sha16(raw)

    def dump(target: Path) -> None:
        if target.suffix.lower() == ".svg":
            try:
                target.write_text(raw.decode("utf-8"), encoding="utf-8")
                return
            except UnicodeDecodeError:
                pass
        target.write_bytes(raw)

    if path.exists():
        if sha16(path.read_bytes()) == digest:
            return path
        sibling = path.with_name(f"{path.stem}-{digest[:8]}{path.suffix}")
        n = 2
        while sibling.exists() and sha16(sibling.read_bytes()) != digest:
            sibling = path.with_name(f"{path.stem}-{digest[:8]}-{n}{path.suffix}")
            n += 1
        if not sibling.exists():
            dump(sibling)
        return sibling

    dump(path)
    return path


def strip_data_uris(css: str) -> str:
    out: list[str] = []
    i = 0
    marker = "url("
    while True:
        j = css.find(marker, i)
        if j < 0:
            out.append(css[i:])
            break
        out.append(css[i:j])
        k = j + len(marker)
        while k < len(css) and css[k] in " \t\n\r\"'":
            k += 1
        if css.startswith("data:", k):
            depth = 1
            p = j + len(marker)
            while p < len(css) and depth:
                if css[p] == "(":
                    depth += 1
                elif css[p] == ")":
                    depth -= 1
                p += 1
            out.append("url(__DATA__)")
            i = p
        else:
            out.append(marker)
            i = j + len(marker)
    return "".join(out)


def extract_gradients(style: str, locale: str, proto_name: str) -> list[dict]:
    style = strip_data_uris(style)
    grads: list[dict] = []
    i = 0
    n = len(style)
    while i < n:
        if style[i] == "@":
            brace = style.find("{", i)
            if brace < 0:
                break
            depth = 0
            j = brace
            while j < n:
                if style[j] == "{":
                    depth += 1
                elif style[j] == "}":
                    depth -= 1
                    if depth == 0:
                        j += 1
                        break
                j += 1
            grads.extend(extract_gradients(style[brace + 1 : j - 1], locale, proto_name))
            i = j
            continue

        brace = style.find("{", i)
        if brace < 0:
            break
        sel = re.sub(r"\s+", " ", style[i:brace]).strip()
        depth = 0
        j = brace
        while j < n:
            if style[j] == "{":
                depth += 1
            elif style[j] == "}":
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            j += 1
        body = style[brace + 1 : j - 1]
        if "gradient(" in body:
            for kind in ("linear-gradient", "radial-gradient", "conic-gradient"):
                idx = 0
                while True:
                    pos = body.find(kind + "(", idx)
                    if pos < 0:
                        break
                    depth = 0
                    p = pos + len(kind)
                    while p < len(body):
                        if body[p] == "(":
                            depth += 1
                        elif body[p] == ")":
                            depth -= 1
                            if depth == 0:
                                p += 1
                                break
                        p += 1
                    value = body[pos:p]
                    if 10 < len(value) < 2000:
                        grads.append(
                            {
                                "locale": locale,
                                "prototype": proto_name,
                                "selector": sel[-160:],
                                "value": value,
                            }
                        )
                    idx = p
        i = j
    return grads


def main() -> None:
    seen: dict[str, str] = {}
    for path in PUBLIC.rglob("*"):
        if path.is_file() and path.suffix.lower() in {
            ".png",
            ".svg",
            ".jpg",
            ".webp",
            ".gif",
            ".ico",
            ".woff",
            ".woff2",
        }:
            try:
                seen[sha16(path.read_bytes())] = str(path.relative_to(PUBLIC))
            except OSError:
                pass

    assets: list[dict] = []
    gradients: list[dict] = []
    written = 0

    for proto in PROTOS:
        text = proto.read_text(encoding="utf-8", errors="replace")
        locale = "ar" if ("سعة" in proto.name or "مجموعة" in proto.name) else "en"
        print("processing", proto.name)

        start = 0
        while True:
            idx = text.find("data:", start)
            if idx < 0:
                break
            parsed = extract_data_uri_at(text, idx)
            start = idx + 5
            if not parsed:
                continue
            mime, raw, end_index = parsed
            start = max(start, end_index)
            digest = sha16(raw)
            before = text[max(0, idx - 600) : idx]
            ext = MIME_EXT.get(mime, "bin")

            alt = None
            img = re.search(r"<img\b([^>]{0,1200})$", before, re.I | re.S)
            if img:
                am = re.search(r'alt=["\']([^"\']*)["\']', img.group(1), re.I)
                if am and am.group(1).strip():
                    alt = am.group(1).strip()

            selector = None
            brace = before.rfind("{")
            if brace != -1:
                sel_start = before.rfind("}", 0, brace)
                selector = re.sub(r"\s+", " ", before[sel_start + 1 : brace]).strip()[-120:]

            rel = None
            if selector:
                for key, canon in SELECTOR_CANONICAL.items():
                    if key in selector:
                        rel = canon
                        break

            if rel is None and "<link" in before[-400:].lower() and "icon" in before[-400:].lower():
                rel = "icons/favicon.svg"
            if rel is None and "og:image" in before[-500:]:
                rel = "og/og-share.png"
            if rel is None and (
                re.search(r'class=["\']brand["\']', before[-400:])
                or "orbit-center" in before[-400:]
            ):
                rel = "logos/sah-group-logo.png"

            if rel is None and alt:
                stem = slugify_ascii(alt, f"{locale}-{digest[:8]}")
                logo_keys = (
                    "partner",
                    "elm",
                    "ministry",
                    "cardiff",
                    "teamo",
                    "cpd",
                    "university",
                    "cultural",
                    "strategic",
                    "lego serious",
                    "technical",
                    "vocational",
                )
                if any(k in alt.lower() for k in logo_keys):
                    rel = f"logos/{stem}.png"
                elif any(k in alt.lower() for k in ("huda", "ghada")):
                    rel = f"images/founders/{stem}.png"
                else:
                    rel = f"images/{stem}.{ext}"

            if rel is None:
                if mime == "image/svg+xml":
                    rel = f"svg/{locale}-{digest[:8]}.svg"
                else:
                    rel = f"images/{locale}-{digest[:8]}.{ext}"

            if digest in seen:
                path_rel = seen[digest]
            else:
                path = write_never_replace(rel, raw)
                path_rel = str(path.relative_to(PUBLIC))
                if path_rel == rel or not (PUBLIC / rel).exists():
                    written += 1
                seen[digest] = path_rel

            assets.append(
                {
                    "hash": digest,
                    "path": seen[digest],
                    "requested": rel,
                    "mime": mime,
                    "bytes": len(raw),
                    "locale": locale,
                    "prototype": proto.name,
                    "alt": alt,
                    "selector": selector,
                }
            )

        for sm in re.finditer(r"<style[^>]*>([\s\S]*?)</style>", text, re.I):
            gradients.extend(extract_gradients(sm.group(1), locale, proto.name))

        # inline SVG elements
        for sm in re.finditer(r"(<svg\b[\s\S]*?</svg>)", text, re.I):
            svg = sm.group(1).encode("utf-8")
            digest = sha16(svg)
            rel = f"svg/{locale}-inline-{digest[:8]}.svg"
            if digest not in seen:
                path = write_never_replace(rel, svg)
                seen[digest] = str(path.relative_to(PUBLIC))
                written += 1

    uniq_grads: list[dict] = []
    seen_g: set[tuple[str, str]] = set()
    for g in gradients:
        key = (g["selector"], g["value"])
        if key in seen_g:
            continue
        seen_g.add(key)
        uniq_grads.append(g)

    lines = [
        "/* Exact gradient declarations extracted from HTML prototypes. */",
        "/* Do not redesign — use these values as-is. */",
        "",
    ]
    for i, g in enumerate(uniq_grads, 1):
        cls = f"proto-gradient-{i:03d}"
        safe_sel = g["selector"].replace("*/", "* /")
        lines.append(f"/* locale={g['locale']} selector: {safe_sel} */")
        lines.append(f".{cls} {{ background-image: {g['value']}; }}")
        lines.append("")
        g["class"] = cls

    grad_path = PUBLIC / "decorations" / "prototype-gradients.css"
    content = "\n".join(lines)
    if not grad_path.exists():
        grad_path.write_text(content, encoding="utf-8")
    elif grad_path.read_text(encoding="utf-8") != content:
        sibling = PUBLIC / "decorations" / f"prototype-gradients-{sha16(content.encode())[:8]}.css"
        if not sibling.exists():
            sibling.write_text(content, encoding="utf-8")
            grad_path = sibling

    for empty in (PUBLIC / "fonts", PUBLIC / "videos"):
        keep = empty / ".gitkeep"
        if not any(empty.iterdir()):
            keep.write_text("", encoding="utf-8")

    summary = {
        "unique_files": len(seen),
        "written_or_aliased_this_run": written,
        "gradients_catalogued": len(uniq_grads),
        "fonts_embedded": 0,
        "videos": 0,
    }
    out = {
        "summary": summary,
        "gradient_css": str(grad_path.relative_to(PUBLIC)),
        "gradients": uniq_grads,
        "assets": assets,
        "files": sorted(set(seen.values())),
    }
    (PUBLIC / "asset-manifest.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, indent=2))
    print("files:", len(seen))


if __name__ == "__main__":
    main()
