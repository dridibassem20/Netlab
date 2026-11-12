import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Lang } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionaries";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { QuizClient } from "./quiz-client";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (locales as readonly string[]).includes(raw) ? (raw as Lang) : "fr";
  const t = getDict(lang).meta.quiz;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/${lang}/quiz` },
  };
}

export default async function QuizPage({ params }: PageProps) {
  const { lang: raw } = await params;
  if (!(locales as readonly string[]).includes(raw)) notFound();
  const lang = raw as Lang;
  const t = getDict(lang);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} t={t.nav} />
      <main id="main-content" className="relative flex-1">
        <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-14">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
            {t.quiz.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.quiz.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-static sm:text-base">
            {t.quiz.intro}
          </p>

          <div className="mt-8 sm:mt-10">
            <QuizClient lang={lang} t={t.quiz} />
          </div>
        </div>
      </main>
      <Footer lang={lang} t={t} />
    </div>
  );
}
