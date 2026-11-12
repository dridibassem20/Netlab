import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { locales, type Lang } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionaries";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Markdown } from "@/components/markdown";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const post = data as Post | null;
  if (!post || !post.published) return null;
  return post;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = (locales as readonly string[]).includes(raw) ? (raw as Lang) : "fr";
  const post = await getPost(slug);
  if (!post) return { title: getDict(lang).notFound.title };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const ogImages = post.cover_url ? [{ url: post.cover_url }] : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/${lang}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/${lang}/blog/${post.slug}`,
      publishedTime: post.created_at,
      authors: ["NetLab"],
      tags: [post.category],
      images: ogImages,
    },
    twitter: {
      card: post.cover_url ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { lang: raw, slug } = await params;
  if (!(locales as readonly string[]).includes(raw)) notFound();
  const lang = raw as Lang;
  const t = getDict(lang);
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} t={t.nav} />
      <main id="main-content" className="relative flex-1">
        <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />

        <article className="relative mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-14">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-signal"
          >
            <ArrowLeft size={13} />
            {t.allArticles}
          </Link>

          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-signal/40 bg-signal/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-signal">
                {t.categories[post.category] ?? post.category}
              </span>
              <time
                dateTime={post.created_at}
                className="font-mono text-xs text-faint"
              >
                {formatDate(post.created_at, lang)}
              </time>
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 border-l-2 border-signal/50 pl-4 text-base leading-relaxed text-static">
                {post.excerpt}
              </p>
            )}
          </header>

          {post.cover_url && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card border border-line">
              <Image
                src={post.cover_url}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mt-10">
            <Markdown>{post.content}</Markdown>
          </div>

          <footer className="mt-14 border-t border-line pt-6">
            <Link
              href={`/${lang}/blog`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-signal"
            >
              <ArrowLeft size={13} />
              {t.backToBlog}
            </Link>
          </footer>
        </article>
      </main>
      <Footer lang={lang} t={t} />
    </div>
  );
}
