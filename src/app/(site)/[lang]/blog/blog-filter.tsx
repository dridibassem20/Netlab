"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Lang } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PostCard } from "@/components/post-card";

export function BlogFilter({
  posts,
  lang,
  t,
}: {
  posts: Post[];
  lang: Lang;
  t: Dict;
}) {
  const [category, setCategory] = useState<string>("__all");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))),
    [posts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const catOk = category === "__all" || p.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    });
  }, [posts, category, query]);

  const isFr = lang === "fr";
  const chipLabel = (cat: string) =>
    cat === "__all" ? (isFr ? "Tout" : "All") : (t.categories[cat] ?? cat);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={isFr ? "Filtre par thème" : "Category filter"}>
          {["__all", ...categories].map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                category === cat
                  ? "border-signal/50 bg-signal/10 text-signal"
                  : "border-line text-static hover:border-signal/30 hover:text-ink",
              )}
            >
              {chipLabel(cat)}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isFr ? "chercher un article…" : "search articles…"}
            aria-label={isFr ? "Chercher un article" : "Search articles"}
            className="w-full rounded-field border border-line bg-panel py-2.5 pl-9 pr-3 font-mono text-xs text-ink placeholder:text-faint/60 focus:border-signal/60"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              lang={lang}
              t={t}
              delay={Math.min(i * 0.05, 0.3)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-card border border-dashed border-line bg-rack/50 p-8 text-center sm:p-12">
          <p className="font-mono text-sm text-faint">
            {isFr
              ? "aucun article ne correspond à ce filtre"
              : "no articles match that filter"}
          </p>
          <p className="mt-2 text-sm text-static">
            {isFr
              ? "Essayez un autre thème ou une recherche plus courte."
              : "Try a different category or a shorter search."}
          </p>
        </div>
      )}
    </div>
  );
}
