"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Lang } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroCopy({ lang, t }: { lang: Lang; t: Dict["hero"] }) {
  return (
    <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pb-20 sm:pt-24 md:pt-32">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal sm:text-xs sm:tracking-[0.25em]"
      >
        {t.eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
        className="mt-5 max-w-2xl font-display text-[2.5rem] font-bold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl"
      >
        {t.titleA}
        <br />
        {t.titlePre} <span className="text-signal">{t.titleAccent1}</span>{" "}
        {t.titleMid} <span className="text-signal">{t.titleAccent2}</span>.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.16, ease: EASE }}
        className="mt-5 max-w-xl text-base leading-relaxed text-static sm:text-lg"
      >
        {t.sub}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Link
          href={`/${lang}/subnet`}
          className="rounded-field bg-signal px-5 py-3 text-center text-sm font-semibold text-terminal shadow-[0_0_28px_rgba(56,225,255,0.35)] transition-all hover:shadow-[0_0_40px_rgba(56,225,255,0.5)] hover:bg-[#5ce9ff] sm:w-auto"
        >
          {t.ctaPrimary}
        </Link>
        <Link
          href={`/${lang}/quiz`}
          className="rounded-field border border-line bg-rack/70 px-5 py-3 text-center text-sm font-medium text-ink backdrop-blur-sm transition-colors hover:border-signal/40 hover:text-signal sm:w-auto"
        >
          {t.ctaSecondary}
        </Link>
      </motion.div>
    </div>
  );
}
