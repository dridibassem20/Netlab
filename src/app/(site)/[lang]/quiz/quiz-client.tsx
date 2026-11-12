"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, RefreshCw, Trophy, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  generateSubnetQuiz,
  makeRng,
  type GeneratedQuestion,
} from "@/lib/quiz/generator";
import type { Lang } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";
import { QuizCard } from "@/components/quiz-card";

type Mode = "subnetting" | "theory" | "mixed";
type Phase = "select" | "loading" | "playing" | "done";

type QDict = Dict["quiz"];

interface RuntimeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  meta: string;
}

interface MissedQuestion {
  question: string;
  correct: string;
  chosen: string | null;
}

const QUESTION_COUNT = 10;

const MODE_ID_TO_KEY: Record<Mode, 0 | 1 | 2> = {
  subnetting: 0,
  theory: 1,
  mixed: 2,
};

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function fromGenerated(
  q: GeneratedQuestion,
  lang: Lang,
): RuntimeQuestion {
  const { kind, ip, prefix } = q.meta;
  const kindLabel: Record<GeneratedQuestion["meta"]["kind"], string> =
    lang === "fr"
      ? {
          broadcast: "broadcast",
          network: "réseau",
          firstHost: "1er hôte",
          lastHost: "dernier hôte",
          usableHosts: "nb d'hôtes",
          wildcard: "wildcard",
        }
      : {
          broadcast: "broadcast",
          network: "network",
          firstHost: "1st host",
          lastHost: "last host",
          usableHosts: "host count",
          wildcard: "wildcard",
        };
  return {
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    meta: `${kindLabel[kind]} · ${ip}/${prefix}`,
  };
}

function fromDb(q: Question, t: QDict): RuntimeQuestion {
  return {
    question: q.question,
    options: q.options,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    meta: `${q.topic} · ${t.difficulty.replace("{n}", String(q.difficulty))}`,
  };
}

export function QuizClient({ lang, t }: { lang: Lang; t: QDict }) {
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<Mode>("subnetting");
  const [questions, setQuestions] = useState<RuntimeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "guest" | "error"
  >("idle");

  const reduce = useReducedMotion();
  const current = questions[index];
  const answered = selected !== null;

  /* save result once when the run finishes */
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== "done" || savedRef.current) return;
    savedRef.current = true;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setSaveState("guest");
        return;
      }
      setSaveState("saving");
      const { error } = await supabase.from("quiz_results").insert({
        user_id: user.id,
        mode,
        score,
        total: questions.length,
      });
      setSaveState(error ? "error" : "saved");
    })();
  }, [phase, mode, score, questions.length]);

  const start = async (m: Mode) => {
    setMode(m);
    setPhase("loading");
    setLoadError(null);
    savedRef.current = false;
    setSaveState("idle");
    setScore(0);
    setMissed([]);
    setIndex(0);
    setSelected(null);

    const rng = makeRng(Date.now() >>> 0);

    if (m === "subnetting") {
      setQuestions(
        generateSubnetQuiz(QUESTION_COUNT, rng, lang).map((q) =>
          fromGenerated(q, lang),
        ),
      );
      setPhase("playing");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(t.loadError);
      setPhase("select");
      return;
    }

    const pool = shuffle(data as Question[], rng);
    if (m === "theory") {
      setQuestions(pool.slice(0, QUESTION_COUNT).map((q) => fromDb(q, t)));
    } else {
      const theoryCount = QUESTION_COUNT - Math.ceil(QUESTION_COUNT / 2);
      const theoryQs = pool.slice(0, theoryCount).map((q) => fromDb(q, t));
      const genQs = generateSubnetQuiz(
        QUESTION_COUNT - theoryCount,
        rng,
        lang,
      ).map((q) => fromGenerated(q, lang));
      setQuestions(shuffle([...theoryQs, ...genQs], rng));
    }
    setPhase("playing");
  };

  const pick = (i: number) => {
    if (answered || !current) return;
    setSelected(i);
    if (i === current.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setMissed((m) => [
        ...m,
        {
          question: current.question,
          correct: current.options[current.correctIndex],
          chosen: current.options[i],
        },
      ]);
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  /* ── phase: select ─────────────────────────────────────────── */
  if (phase === "select" || phase === "loading") {
    return (
      <div>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.modes.map((m, i) => (
            <motion.button
              key={m.id}
              onClick={() => start(m.id)}
              disabled={phase === "loading"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col rounded-card border border-line bg-rack p-5 text-left transition-colors hover:border-signal/40 hover:bg-rack-hi disabled:opacity-50"
            >
              <span className="font-mono text-xs text-signal">
                [{m.glyph}]
              </span>
              <span className="mt-3 font-display text-base font-semibold tracking-tight group-hover:text-signal">
                {m.title}
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-static">
                {m.description}
              </span>
            </motion.button>
          ))}
        </div>

        {phase === "loading" && (
          <p className="mt-6 flex items-center gap-2 font-mono text-xs text-faint">
            <RefreshCw size={12} className="animate-spin" />
            {t.loading}
          </p>
        )}

        {loadError && (
          <p className="mt-6 rounded-field border border-fault/30 bg-fault/5 px-3.5 py-2.5 font-mono text-xs text-fault" role="alert">
            {loadError}
          </p>
        )}
      </div>
    );
  }

  /* ── phase: playing ────────────────────────────────────────── */
  if (phase === "playing" && current) {
    const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;
    return (
      <div>
        <div className="mb-5">
          <div className="flex items-center justify-between font-mono text-xs text-faint">
            <span>
              {t.question} {index + 1} / {questions.length}
            </span>
            <span>
              {t.score} {score}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-rack-hi">
            <motion.div
              className="h-full rounded-full bg-signal"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <QuizCard
          key={index}
          question={current.question}
          options={current.options}
          correctIndex={current.correctIndex}
          selected={selected}
          onSelect={pick}
          explanation={current.explanation}
          explanationLabel={t.explanation}
          meta={current.meta}
        />

        <div className="mt-5 flex justify-end">
          <button
            onClick={next}
            disabled={!answered}
            className={cn(
              "rounded-field px-5 py-2.5 text-sm font-medium transition-colors",
              answered
                ? "bg-signal text-terminal hover:bg-[#5ce9ff]"
                : "cursor-not-allowed bg-rack-hi text-faint",
            )}
          >
            {index + 1 >= questions.length ? t.seeResults : t.nextQuestion}
          </button>
        </div>
      </div>
    );
  }

  /* ── phase: done ───────────────────────────────────────────── */
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-card border border-line bg-rack p-6 text-center sm:p-10">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-signal/30 bg-signal/10">
          <Trophy size={20} className="text-signal" />
        </span>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-faint">
          {t.runComplete.replace("{mode}", t.modes[MODE_ID_TO_KEY[mode]].title)}
        </p>

        <div className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
          <CountUp value={score} />
          <span className="text-faint"> / {questions.length}</span>
        </div>

        <p className="mt-3 text-sm text-static">
          {pct >= 90 ? t.greatScore : pct >= 70 ? t.goodScore : t.lowScore}
        </p>

        <p className="mt-4 font-mono text-xs" aria-live="polite">
          {saveState === "saved" && (
            <span className="text-ok">{t.saved}</span>
          )}
          {saveState === "saving" && <span className="text-faint">{t.saving}</span>}
          {saveState === "guest" && (
            <span className="text-faint">
              {t.guestBefore}
              <Link
                href={`/${lang}/login?next=${t.loginNext}`}
                className="text-signal hover:underline"
              >
                {t.guestLink}
              </Link>
            </span>
          )}
          {saveState === "error" && (
            <span className="text-fault">{t.saveError}</span>
          )}
        </p>
      </div>

      {missed.length > 0 && (
        <div className="mt-6 rounded-card border border-line bg-rack p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold tracking-tight">
            {t.missed.replace("{n}", String(missed.length))}
          </h3>
          <ul className="mt-4 flex flex-col gap-4">
            {missed.map((m, i) => (
              <li key={i} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <p className="text-sm text-ink">{m.question}</p>
                <p className="mt-1.5 flex items-start gap-1.5 font-mono text-xs text-ok">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                  {m.correct}
                </p>
                {m.chosen && (
                  <p className="mt-1 flex items-start gap-1.5 font-mono text-xs text-fault">
                    <XCircle size={13} className="mt-0.5 shrink-0" />
                    {t.youPicked.replace("{a}", m.chosen)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <button
          onClick={() => start(mode)}
          className="rounded-field bg-signal px-5 py-2.5 text-sm font-semibold text-terminal transition-colors hover:bg-[#5ce9ff]"
        >
          {t.runAgain}
        </button>
        <button
          onClick={() => setPhase("select")}
          className="rounded-field border border-line bg-rack px-5 py-2.5 text-sm text-ink transition-colors hover:border-signal/40 hover:text-signal"
        >
          {t.changeMode}
        </button>
      </div>
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span ref={ref}>0</span>;
}
