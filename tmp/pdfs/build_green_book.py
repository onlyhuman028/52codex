#!/usr/bin/env python3
"""Build the temporary source manifest and printable ChatGPT green book."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import shutil
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple
from urllib.parse import unquote, urlparse


SECTION_SPECS = (
    ("guide", "第一篇｜上手指南", "guide"),
    ("tips", "第二篇｜实用技巧", "tips"),
    ("cases", "第三篇｜精选案例", "cases"),
    ("plugins", "第四篇｜插件与技能", "plugins"),
    ("resources", "第五篇｜资源与答疑", "resources"),
    ("appendix", "附录", None),
)

EXCLUDED_FILES = {
    "index.md": "首页由 Vue 组件生成，正文内容在各栏目重复；网络热帖明确排除",
    "resources.md": "旧地址跳转页，内容由 resources/index.md 收录",
    "resources/comment-admin.md": "留言审核后台，不是读者内容",
}

KNOWN_DUPLICATES = {
    "plugins/05-auto-video-edit.md": "cases/03-auto-video-edit.md",
}

IMAGE_RE = re.compile(r"!\[[^\]]*\]\((?:<)?([^\s)>]+)(?:>)?(?:\s+[\"'][^\"']*[\"'])?\)")
HTML_IMAGE_RE = re.compile(r"<img\b[^>]*\bsrc=[\"']([^\"']+)[\"']", re.IGNORECASE)


def _relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def _natural_key(path: Path) -> Tuple[object, ...]:
    parts = re.split(r"(\d+)", path.name.lower())
    return tuple(int(part) if part.isdigit() else part for part in parts)


def discover_reader_pages(root: Path) -> Tuple[List[Path], List[Dict[str, str]]]:
    """Return all reader-facing Markdown pages in publication order."""
    root = root.resolve()
    pages: List[Path] = []
    for directory in ("guide", "tips", "cases", "plugins"):
        section_pages = sorted((root / directory).glob("*.md"), key=_natural_key)
        index_names = {"index.md", "01-index.md"}
        section_pages.sort(key=lambda path: (path.name not in index_names, _natural_key(path)))
        pages.extend(section_pages)

    resources = root / "resources"
    for name in ("index.md", "01-codex-error-lookup.md", "wechat.md"):
        path = resources / name
        if path.exists():
            pages.append(path)

    for name in ("faq.md", "codex-reset.md", "coming-soon.md"):
        path = root / name
        if path.exists():
            pages.append(path)

    excluded = [{"path": path, "reason": reason} for path, reason in EXCLUDED_FILES.items()]
    excluded.append({"path": ".vitepress/theme/HomePage.vue#hot-posts", "reason": "网络热帖"})
    return pages, excluded


def _strip_frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return text
    end = text.find("\n---\n", 4)
    return text[end + 5 :] if end >= 0 else text


def _content_fingerprint(path: Path) -> str:
    normalized = re.sub(r"\s+", " ", path.read_text(encoding="utf-8")).strip()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _section_for(relative_path: str) -> str:
    if relative_path.startswith("guide/"):
        return "guide"
    if relative_path.startswith("tips/"):
        return "tips"
    if relative_path.startswith("cases/"):
        return "cases"
    if relative_path.startswith("plugins/"):
        return "plugins"
    if relative_path.startswith("resources/") or relative_path == "faq.md":
        return "resources"
    return "appendix"


def build_manifest(root: Path) -> Dict[str, object]:
    root = root.resolve()
    pages, excluded = discover_reader_pages(root)
    sections = {key: {"key": key, "title": title, "items": []} for key, title, _ in SECTION_SPECS}
    duplicates: List[Dict[str, str]] = []
    fingerprints: Dict[str, str] = {}

    for page in pages:
        relative_path = _relative(page, root)
        if relative_path in KNOWN_DUPLICATES:
            duplicates.append({"duplicate": relative_path, "canonical": KNOWN_DUPLICATES[relative_path]})
            continue
        fingerprint = _content_fingerprint(page)
        if fingerprint in fingerprints:
            duplicates.append({"duplicate": relative_path, "canonical": fingerprints[fingerprint]})
            continue
        fingerprints[fingerprint] = relative_path
        sections[_section_for(relative_path)]["items"].append(
            {"path": relative_path, "fingerprint": fingerprint}
        )

    return {
        "title": "ChatGPT绿皮书",
        "author": "清风",
        "sections": [sections[key] for key, _, _ in SECTION_SPECS],
        "duplicates": duplicates,
        "excluded": excluded,
    }


def _image_targets(markdown: str) -> Iterable[str]:
    yield from IMAGE_RE.findall(markdown)
    yield from HTML_IMAGE_RE.findall(markdown)


def _resolve_image(root: Path, page: Path, target: str) -> Path | None:
    parsed = urlparse(target)
    if parsed.scheme in {"http", "https", "data"} or target.startswith("//"):
        return None
    clean = unquote(parsed.path)
    if not clean:
        return None
    if clean.startswith("/"):
        project_path = root / clean.lstrip("/")
        return project_path if project_path.exists() else root / "public" / clean.lstrip("/")
    return page.parent / clean


def resolve_markdown_images(root: Path, pages: Sequence[Path]) -> Dict[str, object]:
    root = root.resolve()
    references: List[Dict[str, str]] = []
    missing: List[Dict[str, str]] = []
    external_count = 0
    for page in pages:
        markdown = page.read_text(encoding="utf-8")
        for target in _image_targets(markdown):
            resolved = _resolve_image(root, page, target)
            if resolved is None:
                external_count += 1
                continue
            record = {
                "page": _relative(page, root),
                "target": target,
                "resolved": str(resolved.resolve()),
            }
            references.append(record)
            if not resolved.exists():
                missing.append(record)
    return {
        "reference_count": len(references),
        "external_count": external_count,
        "references": references,
        "missing": missing,
    }


def build_published_asset_map(
    root: Path, pages: Sequence[Path], local_asset_dir: Path
) -> Dict[str, str]:
    """Map source assets to published URLs or MarkText-friendly local files."""
    root = root.resolve()
    dist_assets = root / ".vitepress" / "dist" / "assets"
    if not dist_assets.is_dir():
        raise FileNotFoundError(f"VitePress asset directory not found: {dist_assets}")

    published_by_hash: Dict[str, List[Path]] = {}
    for asset in dist_assets.iterdir():
        if not asset.is_file():
            continue
        digest = hashlib.sha256(asset.read_bytes()).hexdigest()
        published_by_hash.setdefault(digest, []).append(asset)

    mapping: Dict[str, str] = {}
    source_re = re.compile(r"<source\b[^>]*\bsrc=[\"']([^\"']+)[\"']", re.IGNORECASE)
    for page in pages:
        markdown = page.read_text(encoding="utf-8")
        targets = list(_image_targets(markdown)) + source_re.findall(markdown)
        for target in targets:
            resolved = _resolve_image(root, page, target)
            if resolved is None or not resolved.exists():
                continue
            resolved = resolved.resolve()
            key = str(resolved)
            if key in mapping:
                continue
            try:
                public_relative = resolved.relative_to((root / "public").resolve()).as_posix()
            except ValueError:
                public_relative = ""
            if public_relative:
                mapping[key] = f"https://www.52codex.site/{public_relative}"
                continue

            digest = hashlib.sha256(resolved.read_bytes()).hexdigest()
            candidates = published_by_hash.get(digest, [])
            if not candidates:
                local_asset_dir.mkdir(parents=True, exist_ok=True)
                safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "-", resolved.stem).strip("-") or "image"
                filename = f"{safe_stem}-{digest[:10]}{resolved.suffix.lower()}"
                shutil.copy2(resolved, local_asset_dir / filename)
                mapping[key] = f"assets/{filename}"
                continue
            chosen = sorted(candidates, key=lambda path: (len(path.name), path.name))[0]
            mapping[key] = f"https://www.52codex.site/assets/{chosen.name}"
    return mapping


def write_manifest_and_audit(root: Path, output_dir: Path) -> Tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest(root)
    pages, _ = discover_reader_pages(root)
    image_audit = resolve_markdown_images(root, pages)
    manifest_path = output_dir / "book_manifest.json"
    audit_path = output_dir / "source_audit.txt"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    included_count = sum(len(section["items"]) for section in manifest["sections"])
    lines = [
        "《ChatGPT绿皮书》源文件审计",
        f"收录正文：{included_count}",
        f"重复正文：{len(manifest['duplicates'])}",
        f"排除项：{len(manifest['excluded'])}",
        f"本地图片引用：{image_audit['reference_count']}",
        f"外部图片引用：{image_audit['external_count']}",
        f"缺失本地图片：{len(image_audit['missing'])}",
        "",
        "章节：",
    ]
    lines.extend(f"- {section['title']}：{len(section['items'])} 篇" for section in manifest["sections"])
    lines.extend(("", "重复映射："))
    lines.extend(
        f"- {item['duplicate']} -> {item['canonical']}" for item in manifest["duplicates"]
    )
    lines.extend(("", "排除项："))
    lines.extend(f"- {item['path']}：{item['reason']}" for item in manifest["excluded"])
    if image_audit["missing"]:
        lines.extend(("", "缺失图片："))
        lines.extend(
            f"- {item['page']}：{item['target']}" for item in image_audit["missing"]
        )
    audit_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return manifest_path, audit_path


def _parse_frontmatter(source: str) -> Tuple[Dict[str, str], str]:
    if not source.startswith("---\n"):
        return {}, source
    end = source.find("\n---\n", 4)
    if end < 0:
        return {}, source
    values: Dict[str, str] = {}
    for line in source[4:end].splitlines():
        match = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$", line)
        if not match:
            continue
        value = match.group(2).strip().strip('"\'')
        values[match.group(1)] = value
    return values, source[end + 5 :]


def _site_url(page_path: str, target: str) -> str:
    parsed = urlparse(target)
    if parsed.scheme in {"http", "https", "mailto", "data"} or target.startswith("//"):
        return target
    if target.startswith("#"):
        return target
    clean = parsed.path
    suffix = (f"?{parsed.query}" if parsed.query else "") + (f"#{parsed.fragment}" if parsed.fragment else "")
    if clean.startswith("/"):
        return f"https://www.52codex.site{clean}{suffix}"
    base = Path(page_path).parent
    combined = (base / unquote(clean)).as_posix()
    while combined.startswith("../"):
        combined = combined[3:]
    return f"https://www.52codex.site/{combined}{suffix}"


def _published_asset_url(
    page_path: str,
    target: str,
    root: Path | None,
    published_assets: Dict[str, str] | None,
) -> str:
    if root is None or published_assets is None:
        return _site_url(page_path, target)
    page = root / page_path
    resolved = _resolve_image(root, page, target)
    if resolved is None:
        return target
    url = published_assets.get(str(resolved.resolve()))
    if not url:
        raise ValueError(f"No published URL for local asset {target} in {page_path}")
    return url


def _rewrite_markdown_images(
    line: str,
    page_path: str,
    root: Path | None = None,
    published_assets: Dict[str, str] | None = None,
) -> str:
    def replace(match: re.Match[str]) -> str:
        alt = match.group(1)
        target = match.group(2)
        return f"![{alt}]({_published_asset_url(page_path, target, root, published_assets)})"

    pattern = re.compile(
        r"!\[([^\]]*)\]\((?:<)?([^\s)>]+)(?:>)?(?:\s+[\"'][^\"']*[\"'])?\)(?:\{#screenshot\})?"
    )
    return pattern.sub(replace, line)


def _rewrite_markdown_links(line: str, page_path: str) -> str:
    pattern = re.compile(r"(?<!!)\[([^\]]+)\]\(\s*([^\s)]+)(?:\s+[\"'][^\"']*[\"'])?\s*\)")
    return pattern.sub(lambda match: f"[{match.group(1)}]({_site_url(page_path, match.group(2))})", line)


def _clean_html_line(
    line: str,
    page_path: str,
    root: Path | None = None,
    published_assets: Dict[str, str] | None = None,
) -> str:
    if "<" not in line:
        return line.rstrip()
    leading = line[: len(line) - len(line.lstrip())]
    source_match = re.search(r"<source\b[^>]*\bsrc=[\"']([^\"']+)[\"'][^>]*>", line, re.IGNORECASE)
    if source_match:
        return leading + f"[视频文件]({_published_asset_url(page_path, source_match.group(1), root, published_assets)})"

    def image_replace(match: re.Match[str]) -> str:
        attrs = match.group(1)
        src_match = re.search(r"\bsrc=[\"']([^\"']+)[\"']", attrs, re.IGNORECASE)
        if not src_match:
            return ""
        alt_match = re.search(r"\balt=[\"']([^\"']*)[\"']", attrs, re.IGNORECASE)
        alt = alt_match.group(1) if alt_match and alt_match.group(1) else "文章图片"
        return f"![{alt}]({_published_asset_url(page_path, src_match.group(1), root, published_assets)})"

    line = re.sub(r"<img\b([^>]*)/?>", image_replace, line, flags=re.IGNORECASE)

    def anchor_replace(match: re.Match[str]) -> str:
        href = match.group(1)
        label = re.sub(r"<[^>]+>", "", match.group(2)).strip()
        return f"[{label}]({_site_url(page_path, href)})" if label else ""

    line = re.sub(
        r"<a\b[^>]*\bhref=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>",
        anchor_replace,
        line,
        flags=re.IGNORECASE,
    )
    line = re.sub(r"<br\s*/?>", "\n", line, flags=re.IGNORECASE)
    line = re.sub(r"</?(?:div|section|span|strong|p|table|thead|tbody|tr|th|td|video)\b[^>]*>", "", line, flags=re.IGNORECASE)
    return html.unescape(line).rstrip()


def clean_article_markdown(
    source: str,
    page_path: str,
    root: Path | None = None,
    published_assets: Dict[str, str] | None = None,
) -> str:
    """Convert one VitePress article into standard, Feishu-friendly Markdown."""
    frontmatter, body = _parse_frontmatter(source)
    body = re.sub(r"<script\s+setup[^>]*>.*?</script>\s*", "", body, flags=re.DOTALL | re.IGNORECASE)
    body = re.sub(r"<tr\b[^>]*v-for[^>]*>.*?</tr>", "", body, flags=re.DOTALL | re.IGNORECASE)
    title = frontmatter.get("title", "").strip()
    if not title:
        heading = re.search(r"^#\s+(.+)$", body, flags=re.MULTILINE)
        title = heading.group(1).strip() if heading else Path(page_path).stem

    output: List[str] = [f"## {title}", "", f"<!-- source: {page_path} -->"]
    description = frontmatter.get("description", "").strip()
    if description:
        output.extend(("", f"> 摘要：{description}"))
    output.append("")

    first_h1_removed = False
    in_code = False
    container_depth = 0
    for raw_line in body.splitlines():
        stripped = raw_line.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            code_line = raw_line.rstrip()
            output.append(f"> {code_line}" if container_depth else code_line)
            continue
        if in_code:
            code_line = raw_line.rstrip()
            output.append(f"> {code_line}" if container_depth else code_line)
            continue

        if re.fullmatch(r"<[A-Z][A-Za-z0-9]*(?:\s[^>]*)?/>", stripped):
            continue
        if "{{" in stripped and "}}" in stripped:
            continue
        if stripped.startswith(":::"):
            label = stripped[3:].strip()
            if not label:
                if container_depth:
                    container_depth -= 1
                continue
            container_depth += 1
            parts = label.split(maxsplit=1)
            kind = parts[0].lower() if parts else ""
            caption = parts[1].strip() if len(parts) > 1 else ""
            default_labels = {
                "tip": "提示",
                "info": "说明",
                "details": "展开查看",
                "prompt-long": "Prompt",
            }
            output.extend((f"> **{caption or default_labels.get(kind, label)}**", ""))
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", raw_line)
        if heading:
            level = len(heading.group(1))
            heading_text = heading.group(2).strip()
            if level == 1 and not first_h1_removed:
                first_h1_removed = True
                if heading_text == title or heading_text.lstrip("0123456789. ") in title:
                    continue
            new_level = min(level + 2, 6)
            raw_line = f"{'#' * new_level} {heading_text}"

        raw_line = raw_line.replace("🚧", "").rstrip()
        raw_line = re.sub(r"\{#screenshot\}", "", raw_line)
        raw_line = _rewrite_markdown_images(raw_line, page_path, root, published_assets)
        raw_line = _rewrite_markdown_links(raw_line, page_path)
        raw_line = _clean_html_line(raw_line, page_path, root, published_assets)
        if container_depth:
            output.append(f"> {raw_line}" if raw_line else ">")
        elif raw_line or (output and output[-1] != ""):
            output.append(raw_line.rstrip())

    text = "\n".join(output)
    text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"
    return text


def _markdown_slug(title: str) -> str:
    slug = title.strip().lower()
    slug = re.sub(r"[^\w\u3400-\u9fff\- ]+", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    return slug.strip("-")


def _article_title(root: Path, item: Dict[str, str]) -> str:
    source = (root / item["path"]).read_text(encoding="utf-8")
    frontmatter, body = _parse_frontmatter(source)
    heading = re.search(r"^#\s+(.+)$", body, flags=re.MULTILINE)
    return (frontmatter.get("title") or (heading.group(1) if heading else Path(item["path"]).stem)).strip()


def _index_links(root: Path, items: Sequence[Dict[str, str]], anchors: Dict[str, str]) -> str:
    lines = []
    for item in items:
        title = _article_title(root, item)
        lines.append(f"- [{title}](#{anchors[item['path']]})")
    return "\n".join(lines)


def _supplement_index_article(
    root: Path,
    path: str,
    article: str,
    manifest: Dict[str, object],
    anchors: Dict[str, str],
) -> str:
    sections = {section["key"]: section for section in manifest["sections"]}
    if path == "guide/index.md":
        items = [item for item in sections["guide"]["items"] if item["path"] != path]
        listing = _index_links(root, items, anchors)
        article = re.sub(
            r"#### 按顺序学习\n.*?(?=> \*\*不用从头看)",
            f"#### 按顺序学习\n\n{listing}\n\n",
            article,
            flags=re.DOTALL,
        )
    elif path == "tips/01-index.md":
        items = [item for item in sections["tips"]["items"] if item["path"] != path]
        listing = _index_links(root, items, anchors)
        article = re.sub(
            r"#### 用法技巧\n\n#### 工程化",
            f"#### 全部技巧\n\n{listing}",
            article,
        )
    elif path == "cases/index.md":
        groups: Dict[str, List[Dict[str, str]]] = {"1": [], "2": [], "3": []}
        for item in sections["cases"]["items"]:
            if item["path"] == path:
                continue
            source = (root / item["path"]).read_text(encoding="utf-8")
            frontmatter, _ = _parse_frontmatter(source)
            groups.setdefault(str(frontmatter.get("level", "2")), []).append(item)
        labels = (("1", "Lv.1 入门"), ("2", "Lv.2 进阶"), ("3", "Lv.3 系统级"))
        for level, label in labels:
            listing = _index_links(root, groups.get(level, []), anchors) or "- 待补充"
            article = article.replace(f"#### {label}\n", f"#### {label}\n\n{listing}\n")
    elif path == "plugins/index.md":
        items = [item for item in sections["plugins"]["items"] if item["path"] != path]
        listing = _index_links(root, items, anchors)
        canonical_anchor = anchors["cases/03-auto-video-edit.md"]
        listing += f"\n- [视频剪辑插件 HyperFrames（正文见精选案例）](#{canonical_anchor})"
        article = re.sub(r"#### 技能\n.*?#### 插件\n", f"#### 插件与技能目录\n\n{listing}\n", article, flags=re.DOTALL)
    return article


def build_book_markdown(root: Path, manifest: Dict[str, object], output_path: Path) -> Dict[str, int]:
    root = root.resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sections = manifest["sections"]
    article_count = sum(len(section["items"]) for section in sections)
    page_paths = [root / item["path"] for section in sections for item in section["items"]]
    published_assets = build_published_asset_map(root, page_paths, output_path.parent / "assets")

    slug_counts: Dict[str, int] = {}
    anchors: Dict[str, str] = {}

    def reserve_slug(title: str) -> str:
        base = _markdown_slug(title)
        count = slug_counts.get(base, 0)
        slug_counts[base] = count + 1
        return base if count == 0 else f"{base}-{count}"

    for heading in ("ChatGPT绿皮书", "使用说明", "前言", "首页导读", "目录"):
        reserve_slug(heading)
    section_anchors: Dict[str, str] = {}
    for section in sections:
        section_anchors[section["key"]] = reserve_slug(section["title"])
        for item in section["items"]:
            anchors[item["path"]] = reserve_slug(_article_title(root, item))

    lines = [
        "# ChatGPT绿皮书",
        "",
        "**CHATGPT · GREEN BOOK**",
        "",
        "写给非程序员的 ChatGPT Work、Codex 与 AI 实战使用手册",
        "",
        "**作者：清风**",
        "",
        "**版本：v1.0 · 2026-11-25**",
        "",
        "---",
        "",
        "## 使用说明",
        "",
        "本书整理自 52codex.site 的读者内容，面向不会编程、刚接触 Codex，以及想把业务经验和想法做成工具的普通用户。",
        "",
        "本书为非官方指南，不代表 OpenAI 官方文档或产品承诺。产品更新较快，功能、模型、额度和界面请以实际版本与官方说明为准。",
        "",
        "本版收录站内上手指南、实用技巧、精选案例、插件与技能、资源与答疑及附录。",
        "",
        "导入飞书后，可将可选封面图插入文档最前方，再按需要设置分页并导出 PDF。",
        "",
        "## 前言",
        "",
        "这本书不要求你先学会编程。你只需要从一个具体问题或想法开始，学会把需求说清楚，让 Codex 帮你写、改、测，再用项目规则和工作流逐步提高稳定性。",
        "",
        "## 首页导读",
        "",
        "**从编程神器到全能助手**",
        "",
        "### 借助 Codex，构建你想要的一切",
        "",
        "技术小白的 Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。",
        "",
        "本站内容分为精选案例、上手指南、实用技巧、插件与技能、常见问题和资源答疑。本书按相同路线整理为可连续阅读的章节。",
        "",
        "## 目录",
        "",
    ]
    for section in sections:
        lines.append(f"- [{section['title']}](#{section_anchors[section['key']]})")
        for item in section["items"]:
            title = _article_title(root, item)
            lines.append(f"  - [{title}](#{anchors[item['path']]})")
        if section["key"] == "plugins":
            lines.append(
                f"  - [视频剪辑插件 HyperFrames（正文见精选案例）](#{anchors['cases/03-auto-video-edit.md']})"
            )
    lines.extend(("", "---", ""))

    image_count = 0
    for section in sections:
        lines.extend((f"# {section['title']}", ""))
        for item in section["items"]:
            source = (root / item["path"]).read_text(encoding="utf-8")
            article = clean_article_markdown(source, item["path"], root, published_assets)
            article = _supplement_index_article(root, item["path"], article, manifest, anchors)
            if item["path"] == "codex-reset.md":
                article = article.rstrip() + (
                    "\n\n该页面用于查看 Codex 额度重置、重置卡发放动态、历史记录和适用范围。"
                    "\n\n[打开在线重置监控](https://www.52codex.site/codex-reset)\n"
                )
            image_count += len(re.findall(r"!\[[^\]]*\]\([^\n)]+\)", article))
            lines.extend((article.rstrip(), "", "---", ""))

    book = "\n".join(lines).rstrip() + "\n"
    output_path.write_text(book, encoding="utf-8")
    return {
        "article_count": article_count,
        "image_count": image_count,
        "line_count": len(book.splitlines()),
        "character_count": len(book),
    }


def build_cover_png(output_path: Path) -> Path:
    """Render the optional A4-ratio green cover used as the Feishu first page."""
    from PIL import Image, ImageDraw, ImageFont

    width, height = 1600, 2263
    cream = (247, 243, 232)
    deep_green = (0, 98, 65)
    ink = (20, 55, 43)
    sage = (220, 231, 221)
    mid_green = (47, 125, 89)
    warm_gold = (186, 146, 74)
    muted = (82, 100, 91)

    image = Image.new("RGB", (width, height), cream)
    draw = ImageDraw.Draw(image)

    chinese_medium = "/System/Library/Fonts/STHeiti Medium.ttc"
    chinese_light = "/System/Library/Fonts/STHeiti Light.ttc"
    english_bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    english_regular = "/System/Library/Fonts/Supplemental/Arial.ttf"

    def font(path: str, size: int) -> ImageFont.FreeTypeFont:
        return ImageFont.truetype(path, size=size)

    def letterspaced(text: str, x: int, y: int, face: ImageFont.FreeTypeFont, fill: tuple, spacing: int) -> None:
        cursor = x
        for character in text:
            draw.text((cursor, y), character, font=face, fill=fill)
            bbox = draw.textbbox((cursor, y), character, font=face)
            cursor += bbox[2] - bbox[0] + spacing

    draw.rectangle((0, 0, 54, height), fill=deep_green)
    draw.rectangle((54, 0, 65, height), fill=warm_gold)

    top_y = 148
    letterspaced("CHATGPT · GREEN BOOK", 145, top_y, font(english_bold, 28), ink, 4)
    letterspaced("NON-OFFICIAL GUIDE / 非官方指南", 935, top_y + 2, font(chinese_light, 22), muted, 2)
    draw.line((145, 210, 1480, 210), fill=ink, width=2)

    letterspaced("写 给 普 通 人 的  A I  实 战 手 册", 145, 500, font(chinese_light, 25), mid_green, 3)
    draw.text((145, 615), "ChatGPT", font=font(english_bold, 132), fill=mid_green)
    draw.text((145, 760), "绿皮书", font=font(chinese_medium, 218), fill=ink)

    draw.rectangle((145, 1070, 300, 1081), fill=warm_gold)
    draw.text((342, 1030), "从入门到实战案例的全链路使用指南", font=font(chinese_medium, 40), fill=ink)
    draw.text((145, 1147), "非官方实战指南 · 持续更新版", font=font(chinese_light, 27), fill=muted)

    draw.text((145, 1315), "编著 / BY", font=font(chinese_light, 25), fill=mid_green)
    draw.text((300, 1308), "清风", font=font(chinese_medium, 36), fill=ink)

    card = (1055, 500, 1480, 1280)
    draw.rounded_rectangle(card, radius=42, fill=sage, outline=deep_green, width=4)
    center_x, center_y = 1268, 775
    draw.ellipse((1128, 635, 1408, 915), outline=deep_green, width=7)
    draw.ellipse((1182, 689, 1354, 861), outline=mid_green, width=4)
    draw.arc((1207, 714, 1329, 836), 210, 510, fill=warm_gold, width=9)
    draw.polygon([(1268, 738), (1213, 794), (1268, 812), (1323, 794)], fill=deep_green)
    draw.line((1268, 805, 1268, 908), fill=deep_green, width=7)
    draw.ellipse((1208, 852, 1266, 913), fill=mid_green)
    draw.ellipse((1270, 852, 1328, 913), fill=mid_green)
    letterspaced("BUILD WITH AI", 1137, 985, font(english_bold, 25), deep_green, 3)
    draw.text((1137, 1040), "用想法做工具", font=font(chinese_medium, 35), fill=ink)
    draw.line((1137, 1105, 1398, 1105), fill=warm_gold, width=4)
    draw.text((1137, 1140), "52CODEX · PRACTICAL GUIDE", font=font(english_regular, 18), fill=muted)

    draw.line((145, 1745, 1480, 1745), fill=ink, width=2)
    sections = [
        ("01", "上手指南"),
        ("02", "实用技巧"),
        ("03", "精选案例"),
        ("04", "插件技能"),
        ("05", "资源答疑"),
    ]
    column_width = 250
    for index, (number, label) in enumerate(sections):
        x = 145 + index * (column_width + 18)
        draw.rectangle((x, 1790, x + 225, 1797), fill=mid_green)
        draw.text((x, 1830), number, font=font(english_bold, 22), fill=mid_green)
        draw.text((x, 1885), label, font=font(chinese_light, 24), fill=ink)

    draw.text((145, 2090), "适合从零开始、希望把工作经验与想法做成工具的非技术用户。", font=font(chinese_light, 24), fill=muted)
    draw.text((145, 2135), "内容整理自 52codex.site · 以实际产品版本和官方说明为准", font=font(chinese_light, 21), fill=muted)
    draw.text((1320, 2070), "v1.0", font=font(english_bold, 46), fill=mid_green)
    draw.text((1320, 2134), "2026 · 11", font=font(english_regular, 22), fill=muted)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG", optimize=True)
    return output_path


def audit_book_markdown(root: Path, manifest: Dict[str, object], markdown_path: Path) -> Dict[str, object]:
    """Validate that the merged Markdown is complete and Feishu-friendly."""
    root = root.resolve()
    text = markdown_path.read_text(encoding="utf-8")
    violations: List[str] = []
    sections = manifest["sections"]
    items = [item for section in sections for item in section["items"]]

    for item in items:
        marker = f"<!-- source: {item['path']} -->"
        count = text.count(marker)
        if count != 1:
            violations.append(f"source marker count {count}: {item['path']}")
    for section in sections:
        heading = f"# {section['title']}"
        if text.splitlines().count(heading) != 1:
            violations.append(f"section heading count is not 1: {section['title']}")

    image_targets = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", text)
    for target in image_targets:
        if target.startswith("assets/"):
            if not (markdown_path.parent / unquote(target)).is_file():
                violations.append(f"missing local image: {target}")
            continue
        if not target.startswith("https://"):
            violations.append(f"non-HTTPS image: {target}")
            continue
        parsed = urlparse(target)
        if parsed.netloc not in {"52codex.site", "www.52codex.site"}:
            continue
        relative = unquote(parsed.path.lstrip("/"))
        project_path = root / relative
        public_path = root / "public" / relative
        dist_path = root / ".vitepress" / "dist" / relative
        if not project_path.exists() and not public_path.exists() and not dist_path.exists():
            violations.append(f"missing site image source: {target}")

    in_fence = False
    fence_marker = ""
    for line_number, line in enumerate(text.splitlines(), start=1):
        stripped = line.lstrip()
        marker_match = re.match(r"(`{3,}|~{3,})", stripped)
        if not marker_match:
            continue
        marker = marker_match.group(1)
        if not in_fence:
            in_fence = True
            fence_marker = marker[0]
        elif marker[0] == fence_marker:
            in_fence = False
            fence_marker = ""
    if in_fence:
        violations.append("unclosed code fence")

    forbidden_tokens = ("网络热帖", "<script", "<ContentList", "<CodexResetMonitor", "{#screenshot}", "{{", "}}", "🚧")
    for token in forbidden_tokens:
        if token in text:
            violations.append(f"forbidden token remains: {token}")
    if re.search(r"\]\(\s+", text):
        violations.append("Markdown link contains leading target whitespace")
    without_comments = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    raw_html = re.findall(r"</?[A-Za-z][^>]*>", without_comments)
    if raw_html:
        violations.append(f"raw HTML remains: {raw_html[0]}")

    return {
        "violations": violations,
        "section_count": len(sections),
        "article_count": len(items),
        "image_count": len(image_targets),
        "prompt_count": len(re.findall(r"^> \*\*Prompt", text, flags=re.MULTILINE | re.IGNORECASE)),
        "table_row_count": len(re.findall(r"^\|", text, flags=re.MULTILINE)),
        "line_count": len(text.splitlines()),
        "character_count": len(text),
    }


def write_markdown_audit(audit: Dict[str, object], output_path: Path) -> Path:
    lines = [
        "《ChatGPT绿皮书》Markdown 验收",
        f"状态：{'通过' if not audit['violations'] else '未通过'}",
        f"章节：{audit['section_count']}",
        f"文章：{audit['article_count']}",
        f"图片：{audit['image_count']}",
        f"Prompt：{audit['prompt_count']}",
        f"表格行：{audit['table_row_count']}",
        f"总行数：{audit['line_count']}",
        f"字符数：{audit['character_count']}",
        "",
        "问题：",
    ]
    lines.extend(f"- {item}" for item in audit["violations"])
    if not audit["violations"]:
        lines.append("- 无")
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--manifest-only", action="store_true")
    parser.add_argument("--markdown-output", type=Path)
    args = parser.parse_args()
    manifest_path, _ = write_manifest_and_audit(args.root, args.output_dir)
    if not args.manifest_only:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        markdown_output = args.markdown_output or args.root / "output" / "markdown" / "ChatGPT绿皮书.md"
        stats = build_book_markdown(args.root, manifest, markdown_output)
        build_cover_png(markdown_output.with_name("ChatGPT绿皮书封面.png"))
        audit = audit_book_markdown(args.root, manifest, markdown_output)
        write_markdown_audit(audit, args.output_dir / "markdown_audit.txt")
        if audit["violations"]:
            raise SystemExit("Markdown audit failed: " + "; ".join(audit["violations"]))
        print(json.dumps(stats, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
