"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Lang } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Monospace glyph per category — used on the fallback cover. */
const CATEGORY_GLYPHS: Record<string, string> = {
  OSI: "L1–L7",
  Routing: "/24",
  Wireless: "dBm",
  Fiber: "λ",
  "5G": "NR",
  Security: "ACL",
};

export function PostCard({
  post,
  lang,
  t,
  delay = 0,
}: {
  post: Post;
  lang: Lang;
  t: Pick<Dict, "categories" | "read" | "draft">;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/${lang}/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-rack transition-all duration-200 hover:border-signal/40 hover:shadow-[0_0_36px_rgba(56,225,255,0.08)] focus-visible:shadow-[0_0_36px_rgba(56,225,255,0.08)]"
      >
        <div className="relative aspect-[16/8] overflow-hidden border-b border-line bg-panel">
          {post.cover_url ? (
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(56,225,255,0.09),transparent_65%)]">
              <span className="font-mono text-2xl text-signal/50 transition-colors group-hover:text-signal/80">
                {CATEGORY_GLYPHS[post.category] ?? "· · ·"}
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-md border border-line bg-terminal/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-static backdrop-blur-sm">
            {t.categories[post.category] ?? post.category}
          </span>
          {!post.published && (
            <span className="absolute right-3 top-3 rounded-md border border-warn/40 bg-terminal/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-warn backdrop-blur-sm">
              {t.draft}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-base font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-signal sm:text-lg">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-static">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <time
              dateTime={post.created_at}
              className="font-mono text-[11px] text-faint"
            >
              {formatDate(post.created_at, lang)}
            </time>
            <span className="flex items-center gap-1 font-mono text-[11px] text-faint transition-colors group-hover:text-signal">
              {t.read}
              <ArrowRight
                size={12}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
