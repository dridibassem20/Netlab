import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { locales, type Lang } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionaries";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NetworkHero } from "@/components/network-hero";
import { HeroCopy } from "@/components/hero-copy";
import { ToolCard } from "@/components/tool-card";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (locales as readonly string[]).includes(raw) ? (raw as Lang) : "fr";
  const t = getDict(lang).meta.home;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/${lang}` },
  };
}

export default async function Home({ params }: PageProps) {
  const { lang: raw } = await params;
  if (!(locales as readonly string[]).includes(raw)) notFound();
  const lang = raw as Lang;
  const dict = getDict(lang);
  const t = dict;

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);
  const posts = (data ?? []) as Post[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} t={t.nav} />

      <main id="main-content" className="flex-1">
        {/* ── hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />
          <NetworkHero />

          <HeroCopy lang={lang} t={t.hero} />
        </section>

        {/* ── tools ────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-faint">
                  {t.home.toolsEyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {t.home.toolsTitle}
                </h2>
              </div>
              <Link
                href={`/${lang}/formulas`}
                className="hidden items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-signal sm:flex"
              >
                {t.home.allFormulas} <ArrowRight size={12} />
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.tools.map((tool, i) => (
              <ToolCard
                key={tool.href}
                href={`/${lang}${tool.href}`}
                title={tool.title}
                description={tool.description}
                glyph={tool.glyph}
                openLabel={t.open}
                delay={i * 0.07}
              />
            ))}
          </div>
        </section>

        {/* ── latest posts ─────────────────────────────────── */}
        <section className="border-t border-line bg-panel/40">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <Reveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-faint">
                    {t.home.latestEyebrow}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {t.home.latestTitle}
                  </h2>
                </div>
                <Link
                  href={`/${lang}/blog`}
                  className="hidden items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-signal sm:flex"
                >
                  {t.home.allArticles} <ArrowRight size={12} />
                </Link>
              </div>
            </Reveal>

            {posts.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    lang={lang}
                    t={t}
                    delay={i * 0.07}
                  />
                ))}
              </div>
            ) : (
              <Reveal delay={0.1}>
                <div className="mt-8 rounded-card border border-dashed border-line bg-rack/50 p-8 text-center sm:p-10">
                  <p className="font-mono text-sm text-faint">
                    {t.home.emptyTitle}
                  </p>
                  <p className="mt-2 text-sm text-static">
                    {t.home.emptySubBefore}
                    <Link href="/admin" className="text-signal hover:underline">
                      {t.home.emptySubLink}
                    </Link>
                    {t.home.emptySubAfter}
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      </main>

      <Footer
        lang={lang}
        t={t}
      />
    </div>
  );
}
