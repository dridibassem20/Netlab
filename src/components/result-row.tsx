"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultRowProps {
  label: string;
  value: string;
  /** signal = key result (network bits), ok = green state, fault = failed check. */
  tone?: "default" | "signal" | "ok" | "warn" | "fault";
  copyable?: boolean;
  /** Translated aria label for the copy button. */
  copyAria?: string;
}

const TONES: Record<NonNullable<ResultRowProps["tone"]>, string> = {
  default: "text-ink",
  signal: "text-signal",
  ok: "text-ok",
  warn: "text-warn",
  fault: "text-fault",
};

export function ResultRow({
  label,
  value,
  tone = "default",
  copyable = false,
  copyAria,
}: ResultRowProps) {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable — silent, the value is visible anyway.
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-static">
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "truncate font-mono text-sm sm:text-[15px]",
              TONES[tone],
            )}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {copyable && (
          <button
            onClick={copy}
            className="shrink-0 rounded-md p-1 text-faint transition-colors hover:text-signal"
            aria-label={copyAria ?? `Copy ${label}`}
          >
            {copied ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}
