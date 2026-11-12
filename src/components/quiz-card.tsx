"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: string;
  options: string[];
  correctIndex: number;
  selected: number | null;
  onSelect: (index: number) => void;
  explanation: string;
  explanationLabel: string;
  meta?: string;
}

const LETTERS = ["A", "B", "C", "D"];

export function QuizCard({
  question,
  options,
  correctIndex,
  selected,
  onSelect,
  explanation,
  explanationLabel,
  meta,
}: QuizCardProps) {
  const reduce = useReducedMotion();
  const answered = selected !== null;

  return (
    <div className="rounded-card border border-line bg-rack p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        {meta && (
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
            {meta}
          </span>
        )}
      </div>

      <h2 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
        {question}
      </h2>

      <div className="mt-5 grid gap-2.5">
        {options.map((option, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;

          const state: "idle" | "correct" | "wrong" | "dim" = !answered
            ? "idle"
            : isCorrect
              ? "correct"
              : isSelected
                ? "wrong"
                : "dim";

          return (
            <motion.button
              key={i}
              onClick={() => !answered && onSelect(i)}
              disabled={answered}
              initial={false}
              animate={
                reduce
                  ? undefined
                  : state === "correct"
                    ? { x: [0, 4, 0] }
                    : state === "wrong"
                      ? { x: [0, -4, 0] }
                      : { x: 0 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "flex items-center gap-3.5 rounded-field border px-4 py-3.5 text-left transition-colors",
                state === "idle" &&
                  "border-line bg-panel hover:border-signal/50 hover:bg-rack-hi",
                state === "correct" && "border-ok/60 bg-ok/10",
                state === "wrong" && "border-fault/60 bg-fault/10",
                state === "dim" && "border-line bg-panel opacity-45",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs",
                  state === "idle" && "border-line text-static",
                  state === "correct" && "border-ok/50 text-ok",
                  state === "wrong" && "border-fault/50 text-fault",
                  state === "dim" && "border-line text-faint",
                )}
              >
                {LETTERS[i]}
              </span>
              <span
                className={cn(
                  "min-w-0 break-words font-mono text-sm",
                  state === "correct" && "text-ok",
                  state === "wrong" && "text-fault",
                  state === "dim" && "text-faint",
                  (state === "idle" || state === "correct" || state === "wrong") &&
                    "text-ink",
                )}
              >
                {option}
              </span>
              {answered && isCorrect && (
                <Check size={16} className="ml-auto shrink-0 text-ok" />
              )}
              {answered && state === "wrong" && (
                <X size={16} className="ml-auto shrink-0 text-fault" />
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={false}
        animate={{ height: "auto", opacity: 1 }}
        style={{ overflow: "hidden" }}
        key={answered ? "exp" : "noexp"}
      >
        {answered && (
          <div className="mt-5 rounded-field border border-line bg-panel p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-signal">
              {explanationLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-static">{explanation}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
