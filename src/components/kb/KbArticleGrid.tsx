"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight } from "lucide-react";
import type { KbArticleMeta, KbCategory } from "@/lib/kb-types";
import { KB_CATEGORY_LABELS, KB_CATEGORY_ORDER } from "@/lib/kb-types";

interface Props {
  articles: KbArticleMeta[];
}

export default function KbArticleGrid({ articles }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q),
    );
  }, [articles, query]);

  const grouped = useMemo(() => {
    const map = new Map<KbCategory, KbArticleMeta[]>();
    for (const a of filtered) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return map;
  }, [filtered]);

  const orderedCategories = KB_CATEGORY_ORDER.filter((c) => grouped.has(c));

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search articles by title or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 placeholder:text-navy-400 shadow-soft focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-navy-100 rounded-xl p-10 text-center">
          <p className="text-navy-500 font-medium">No articles match &ldquo;{query}&rdquo;.</p>
          <p className="text-navy-400 text-sm mt-1">Try a different search or browse by category.</p>
        </div>
      )}

      {/* Categories */}
      {orderedCategories.map((category) => {
        const list = grouped.get(category) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={category}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold text-navy-900">
                {KB_CATEGORY_LABELS[category]}
              </h2>
              <span className="text-xs text-navy-400">{list.length} article{list.length === 1 ? "" : "s"}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {list.map((article) => (
                <Link
                  key={article.slug}
                  href={`/knowledge-base/${article.slug}`}
                  className="group bg-white border border-navy-100 rounded-xl p-5 shadow-soft hover:shadow-card hover:border-ocean-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-navy-900 group-hover:text-ocean-700 transition-colors">
                      {article.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-navy-300 group-hover:text-ocean-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-navy-500 leading-relaxed mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-navy-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.read_time_minutes} min read
                    </span>
                    {article.updated_at && (
                      <span>Updated {article.updated_at}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
