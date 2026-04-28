import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Clock, Globe } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import Header from "@/components/Header";
import { getArticleBySlug, getArticleSlugs, KB_CATEGORY_LABELS } from "@/lib/kb";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Article not found | Shipping Savior",
    };
  }
  return {
    title: `${article.title} | Shipping Savior Knowledge Base`,
    description: article.description,
  };
}

export default function KbArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <article className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-2 text-sm text-ocean-600 hover:text-ocean-700 transition-colors font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Knowledge Base
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-ocean-50 border border-ocean-200 rounded-full px-3 py-1 mb-4">
              <BookOpen className="w-3 h-3 text-ocean-600" />
              <span className="text-xs font-medium text-ocean-700">
                {KB_CATEGORY_LABELS[article.category]}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed mb-4">{article.description}</p>
            <div className="flex items-center gap-4 text-xs text-navy-400">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.read_time_minutes} min read
              </span>
              {article.updated_at && <span>Updated {article.updated_at}</span>}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-navy max-w-none kb-article">
            <MDXRemote source={article.content} />
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-navy-100 bg-white mt-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-sm">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-navy-900">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </a>
          <div className="text-sm text-navy-400">
            International Logistics Platform &mdash; Built with AI Acrobatics
          </div>
          <Link
            href="/knowledge-base"
            className="text-xs text-ocean-600 hover:text-ocean-700 transition-colors font-medium"
          >
            &larr; All Articles
          </Link>
        </div>
      </footer>
    </main>
  );
}
