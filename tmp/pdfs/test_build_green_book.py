import sys
import subprocess
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

from build_green_book import (  # noqa: E402
    build_book_markdown,
    build_manifest,
    clean_article_markdown,
    discover_reader_pages,
    resolve_markdown_images,
)


class ManifestTests(unittest.TestCase):
    def test_discovers_every_reader_page_except_hot_posts_and_internal_pages(self):
        pages, excluded = discover_reader_pages(ROOT)
        paths = [page.relative_to(ROOT).as_posix() for page in pages]

        self.assertIn("guide/index.md", paths)
        self.assertIn("tips/08-sms-verification-platforms.md", paths)
        self.assertIn("cases/10-weekly-plan-system.md", paths)
        self.assertIn("plugins/index.md", paths)
        self.assertIn("resources/index.md", paths)
        self.assertIn("resources/01-codex-error-lookup.md", paths)
        self.assertIn("resources/wechat.md", paths)
        self.assertIn("faq.md", paths)
        self.assertIn("codex-reset.md", paths)
        self.assertIn("coming-soon.md", paths)

        self.assertNotIn("resources/comment-admin.md", paths)
        self.assertNotIn("resources.md", paths)
        self.assertNotIn("index.md", paths)
        self.assertNotIn("AGENTS.md", paths)
        self.assertNotIn("DESIGN.md", paths)
        self.assertTrue(any(item["reason"] == "网络热帖" for item in excluded))

    def test_section_index_pages_lead_each_section(self):
        manifest = build_manifest(ROOT)
        first_paths = {section["key"]: section["items"][0]["path"] for section in manifest["sections"]}

        self.assertEqual(first_paths["guide"], "guide/index.md")
        self.assertEqual(first_paths["tips"], "tips/01-index.md")
        self.assertEqual(first_paths["cases"], "cases/index.md")
        self.assertEqual(first_paths["plugins"], "plugins/index.md")
        self.assertEqual(first_paths["resources"], "resources/index.md")

    def test_manifest_deduplicates_the_repeated_video_article(self):
        manifest = build_manifest(ROOT)
        included = [item["path"] for section in manifest["sections"] for item in section["items"]]

        self.assertIn("cases/03-auto-video-edit.md", included)
        self.assertNotIn("plugins/05-auto-video-edit.md", included)
        self.assertIn("cases/04-skill-ppt.md", included)
        self.assertIn("cases/05-install-openclaw.md", included)
        self.assertIn("cases/09-goal-mode-project.md", included)
        self.assertIn("cases/10-weekly-plan-system.md", included)
        self.assertEqual(
            manifest["duplicates"],
            [{"duplicate": "plugins/05-auto-video-edit.md", "canonical": "cases/03-auto-video-edit.md"}],
        )
        self.assertFalse(any("hot-posts" in path for path in included))

    def test_all_local_markdown_images_resolve(self):
        pages, _ = discover_reader_pages(ROOT)
        audit = resolve_markdown_images(ROOT, pages)

        self.assertGreater(audit["reference_count"], 50)
        self.assertEqual(audit["missing"], [])


class MarkdownTests(unittest.TestCase):
    def test_cleans_vitepress_syntax_and_rewrites_links_without_touching_code(self):
        source = """---
title: 示例文章
description: 面向新手的摘要。
author: 原作者
date: 2026-11-24
---
<script setup>
import Thing from './Thing.vue'
</script>
# 示例文章

::: tip Prompt
请生成一个页面。
补充一条限制。
:::

- 父项
  - 子项

![界面](./assets/example/step-01.png){#screenshot}
[下一篇](/guide/03-what-is-codex)
[带空格链接]( https://example.com/path )
<img src="/images/wechat-qr.png" alt="公众号二维码">
<ContentList section="tips" />

```html
<div>代码必须保留</div>
```
"""
        cleaned = clean_article_markdown(source, "guide/02-example.md")

        self.assertTrue(cleaned.startswith("## 示例文章\n"))
        self.assertIn("> 摘要：面向新手的摘要。", cleaned)
        self.assertNotIn("原文作者", cleaned)
        self.assertNotIn("原文日期", cleaned)
        self.assertIn("> **Prompt**", cleaned)
        self.assertIn("> 请生成一个页面。", cleaned)
        self.assertIn("> 补充一条限制。", cleaned)
        self.assertIn("- 父项\n  - 子项", cleaned)
        self.assertIn(
            "![界面](https://www.52codex.site/guide/assets/example/step-01.png)", cleaned
        )
        self.assertIn("[下一篇](https://www.52codex.site/guide/03-what-is-codex)", cleaned)
        self.assertIn("[带空格链接](https://example.com/path)", cleaned)
        self.assertIn("![公众号二维码](https://www.52codex.site/images/wechat-qr.png)", cleaned)
        self.assertIn("```html\n<div>代码必须保留</div>\n```", cleaned)
        self.assertNotIn("---", cleaned)
        self.assertNotIn("<script", cleaned)
        self.assertNotIn("ContentList", cleaned)
        self.assertNotIn("{#screenshot}", cleaned)

    def test_builds_one_complete_book_with_every_manifest_article(self):
        manifest = build_manifest(ROOT)
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "ChatGPT绿皮书.md"
            stats = build_book_markdown(ROOT, manifest, output)
            book = output.read_text(encoding="utf-8")
            local_assets = list((output.parent / "assets").iterdir())

        expected_articles = sum(len(section["items"]) for section in manifest["sections"])
        self.assertEqual(stats["article_count"], expected_articles)
        self.assertEqual(stats["article_count"], 51)
        self.assertGreater(stats["image_count"], 100)
        self.assertTrue(book.startswith("# ChatGPT绿皮书\n"))
        self.assertIn("**作者：清风**", book)
        self.assertIn("## 目录", book)
        self.assertIn("# 第一篇｜上手指南", book)
        self.assertIn("# 附录", book)
        self.assertNotIn("网络热帖", book)
        self.assertNotIn("<script", book)
        self.assertNotIn("<ContentList", book)
        self.assertNotIn("{#screenshot}", book)
        self.assertEqual(book.count("<!-- source:"), expected_articles)
        self.assertEqual(book.count("```" ) % 2, 0)
        self.assertIn("借助 Codex，构建你想要的一切", book)
        self.assertIn("[打开在线重置监控](https://www.52codex.site/codex-reset)", book)
        self.assertIn("#### Lv.1 入门\n\n- [01 用 Codex 做武侠网页游戏]", book)

        toc = book.split("## 目录", 1)[1].split("\n---\n", 1)[0]
        self.assertEqual(toc.count("  - ["), expected_articles + 1)
        self.assertIn("视频剪辑插件 HyperFrames（正文见精选案例）", toc)
        self.assertIn("/assets/banana-site.BiVO09Kh.png", book)
        self.assertNotIn("/guide/assets/02-what-is-vibe-coding/banana-site.png", book)
        self.assertNotIn("> 原文作者：", book)
        self.assertNotIn("> 原文日期：", book)
        self.assertNotIn("data:image/", book)
        self.assertIn("](assets/", book)
        self.assertEqual(len(local_assets), 5)
        self.assertLess(max(map(len, book.splitlines())), 10000)

    def test_maps_source_assets_to_existing_vitepress_publication_urls(self):
        from build_green_book import build_published_asset_map

        pages, _ = discover_reader_pages(ROOT)
        with tempfile.TemporaryDirectory() as directory:
            mapping = build_published_asset_map(ROOT, pages, Path(directory) / "assets")
            source = (ROOT / "guide/assets/02-what-is-vibe-coding/banana-site.png").resolve()

            self.assertGreater(len(mapping), 140)
            self.assertEqual(
                mapping[str(source)],
                "https://www.52codex.site/assets/banana-site.BiVO09Kh.png",
            )

    def test_book_working_paths_are_classified_for_vitepress_exclusion(self):
        script = """import('./.vitepress/source-excludes.mjs').then(({ isBookWorkingPath }) => {
          const yes = ['output/markdown/ChatGPT绿皮书.md', 'docs/superpowers/plans/book.md', 'tmp/pdfs/book.md'];
          const no = ['guide/02-what-is-vibe-coding.md', 'tips/01-index.md'];
          if (!yes.every(isBookWorkingPath) || no.some(isBookWorkingPath)) process.exit(1);
        });"""
        result = subprocess.run(["node", "-e", script], cwd=ROOT, capture_output=True, text=True)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


class CoverTests(unittest.TestCase):
    def test_builds_a4_green_cover_without_qr_content(self):
        from PIL import Image
        from build_green_book import build_cover_png

        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "cover.png"
            build_cover_png(output)
            with Image.open(output) as image:
                self.assertEqual(image.size, (1600, 2263))
                self.assertEqual(image.mode, "RGB")
                colors = image.getcolors(maxcolors=image.width * image.height)

        self.assertTrue(output.name.endswith(".png"))
        self.assertIsNotNone(colors)
        palette = {color for _, color in colors}
        self.assertIn((0, 98, 65), palette)
        self.assertIn((247, 243, 232), palette)
        self.assertGreater(len(palette), 20)


class AuditTests(unittest.TestCase):
    def test_generated_book_passes_feishu_markdown_audit(self):
        from build_green_book import audit_book_markdown

        manifest = build_manifest(ROOT)
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "ChatGPT绿皮书.md"
            build_book_markdown(ROOT, manifest, output)
            audit = audit_book_markdown(ROOT, manifest, output)

        self.assertEqual(audit["violations"], [])
        self.assertEqual(audit["section_count"], 6)
        self.assertEqual(audit["article_count"], 51)
        self.assertEqual(audit["image_count"], 159)
        self.assertGreater(audit["prompt_count"], 50)
        self.assertGreater(audit["table_row_count"], 50)


if __name__ == "__main__":
    unittest.main()
