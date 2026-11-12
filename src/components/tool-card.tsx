"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  /** Small mono tag shown in the corner, e.g. "/24" or "dB". */
  glyph: string;
  /** Translated "open" affordance label. */
  openLabel: string;
  delay?: number;
}

export function ToolCard({
  href,
  title,
  description,
  glyph,
  openLabel,
  delay = 0,
}: ToolCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        className="group relative flex h-full flex-col rounded-card border border-line bg-rack p-5 transition-all duration-200 hover:border-signal/40 hover:bg-rack-hi hover:shadow-[0_0_36px_rgba(56,225,255,0.08)] focus-visible:shadow-[0_0_36px_rgba(56,225,255,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold tracking-tight text-ink transition-colors group-hover:text-signal sm:text-lg">
            {title}
          </h3>
          <span className="shrink-0 font-mono text-xs text-faint transition-colors group-hover:text-signal">
            [{glyph}]
          </span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-static">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-faint transition-colors group-hover:text-signal">
          {openLabel}
          <ArrowUpRight
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </Link>
    </motion.div>
  );
}
