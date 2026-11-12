import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { locales, type Lang } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionaries";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogFilter } from "./blog-filter";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (locales as readonly string[]).includes(raw) ? (raw as Lang) : "fr";
  const t = getDict(lang).meta.blog;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/${lang}/blog` },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { lang: raw } = await params;
  if (!(locales as readonly string[]).includes(raw)) notFound();
  const lang = raw as Lang;
  const t = getDict(lang);

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} t={t.nav} />
      <main id="main-content" className="relative flex-1">
        <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-14">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
            {t.categories.OSI === "OSI" ? "notes de cours" : "field notes"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.meta.blog.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-static sm:text-base">
            {t.categories.OSI === "OSI"
              ? "Des articles courts, écrits pour réviser — l'essentiel de ce qui tombe en examen, sans remplissage."
              : "Short articles written for exam prep — the parts you actually get asked, without the filler."}
          </p>

          <div className="mt-8 sm:mt-10">
            <BlogFilter posts={posts} lang={lang} t={t} />
          </div>
        </div>
      </main>
      <Footer lang={lang} t={t} />
    </div>
  );
}
