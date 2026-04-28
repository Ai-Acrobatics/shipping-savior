// Server-only: uses fs/path. Do not import from client components.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  KB_VALID_CATEGORIES,
  type KbArticleMeta,
  type KbCategory,
} from "./kb-types";

export type { KbArticleMeta, KbCategory } from "./kb-types";
export { KB_CATEGORY_LABELS, KB_CATEGORY_ORDER } from "./kb-types";

export interface KbArticle extends KbArticleMeta {
  content: string;
}

const KB_DIR = path.join(process.cwd(), "content", "kb");

function isKbCategory(value: unknown): value is KbCategory {
  return typeof value === "string" && (KB_VALID_CATEGORIES as ReadonlyArray<string>).includes(value);
}

function parseArticle(filePath: string): KbArticle {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = typeof data.slug === "string" && data.slug.length > 0
    ? data.slug
    : path.basename(filePath, path.extname(filePath));

  if (!isKbCategory(data.category)) {
    throw new Error(
      `[kb] Article ${slug} has invalid or missing category: ${String(data.category)}`,
    );
  }

  return {
    title: String(data.title ?? slug),
    slug,
    description: String(data.description ?? ""),
    category: data.category,
    published_at: String(data.published_at ?? ""),
    updated_at: String(data.updated_at ?? data.published_at ?? ""),
    read_time_minutes: typeof data.read_time_minutes === "number" ? data.read_time_minutes : 5,
    content,
  };
}

export function getAllArticles(): KbArticle[] {
  if (!fs.existsSync(KB_DIR)) return [];
  const files = fs
    .readdirSync(KB_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const articles = files.map((f) => parseArticle(path.join(KB_DIR, f)));
  articles.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
  return articles;
}

export function getAllArticleMeta(): KbArticleMeta[] {
  return getAllArticles().map(({ content: _content, ...meta }) => meta);
}

export function getArticleBySlug(slug: string): KbArticle | null {
  const all = getAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export function getArticleSlugs(): string[] {
  return getAllArticles().map((a) => a.slug);
}
