"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { getDict } from "@/lib/i18n/dictionaries";
import type { Lang } from "@/lib/i18n/config";

export default function NotFound() {
  const pathname = usePathname();
  const lang: Lang = pathname?.startsWith("/en") ? "en" : "fr";
  const t = getDict(lang).notFound;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <Logo className="mx-auto h-10 w-10" />
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-signal">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-static">
          {t.sub}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={`/${lang}`}
            className="rounded-field bg-signal px-5 py-2.5 text-sm font-semibold text-terminal transition-colors hover:bg-[#5ce9ff]"
          >
            {t.backHome}
          </Link>
          <Link
            href={`/${lang}/blog`}
            className="rounded-field border border-line bg-rack px-5 py-2.5 text-sm text-ink transition-colors hover:border-signal/40 hover:text-signal"
          >
            {t.browse}
          </Link>
        </div>
      </div>
    </div>
  );
}
