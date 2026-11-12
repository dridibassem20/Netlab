"use client";

import Link from "next/link";
import { Logo } from "./logo";

type Lang = "fr" | "en";

type T = {
  nav: {
    subnet: string;
    formulas: string;
    quiz: string;
    blog: string;
  };
  footer: {
    tagline: string;
    madeFor: string;
  };
};

export function Footer({ lang, t }: { lang: Lang; t: T }) {
  const dict: T = t ?? {
    nav: {
      subnet: "Subnet",
      formulas: "Formulas",
      quiz: "Quiz",
      blog: "Blog",
    },
    footer: {
      tagline: "Powered by NetLab",
      madeFor: "Made for",
    },
  };

  const navItems = [
    { href: `/${lang}/subnet`, label: dict.nav.subnet },
    { href: `/${lang}/formulas`, label: dict.nav.formulas },
    { href: `/${lang}/quiz`, label: dict.nav.quiz },
    { href: `/${lang}/blog`, label: dict.nav.blog },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:text-left">
        <div className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <div>
            <p className="font-display text-sm font-semibold tracking-tight">
              Net<span className="text-signal">Lab</span>
            </p>
            <p className="font-mono text-[11px] text-faint">{t.footer.tagline}</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-static">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-signal">
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="font-mono text-[11px] text-faint">
          {t.footer.madeFor} {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}