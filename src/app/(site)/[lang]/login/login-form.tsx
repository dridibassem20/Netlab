"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function LoginForm({
  lang,
  t,
}: {
  lang: Lang;
  t: Dict["login"];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next") ?? "";
  const home = `/${lang}`;

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const go = (target: string) => {
    const dest = !target.startsWith("/") ? home + target : target;
    router.push(dest);
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signup" && password !== confirm) {
      setError(t.mismatch);
      return;
    }

    setBusy(true);
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          if (/confirm/i.test(error.message)) {
            setError(t.confirmFirst);
          } else if (/invalid|credential/i.test(error.message)) {
            setError(t.badCredentials);
          } else {
            setError(error.message);
          }
          return;
        }
        go(nextParam || home);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          go(nextParam || home);
        } else {
          setNotice(t.createdNotice);
          setMode("signin");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-card border border-line bg-rack p-6 sm:p-7"
    >
      <div className="flex flex-col items-center text-center">
        <Logo className="h-10 w-10" />
        <h1 className="mt-4 font-display text-xl font-semibold tracking-tight">
          {mode === "signin" ? t.signinTitle : t.signupTitle}
        </h1>
        <p className="mt-1.5 text-sm text-static">
          {mode === "signin" ? t.signinSub : t.signupSub}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-field border border-line bg-panel p-0.5">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={cn(
              "rounded-[8px] py-2 font-mono text-xs transition-colors",
              mode === m
                ? "bg-signal/15 text-signal"
                : "text-faint hover:text-static",
            )}
          >
            {m === "signin" ? t.signinTab : t.signupTab}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
            {t.email}
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-field border border-line bg-panel px-3.5 py-2.5 text-sm text-ink focus:border-signal/60"
            dir="ltr"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
            {t.password}
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-field border border-line bg-panel px-3.5 py-2.5 text-sm text-ink focus:border-signal/60"
            dir="ltr"
          />
        </label>

        {mode === "signup" && (
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-static">
              {t.confirmPassword}
            </span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-field border border-line bg-panel px-3.5 py-2.5 text-sm text-ink focus:border-signal/60"
              dir="ltr"
            />
          </label>
        )}

        {error && (
          <p
            className="rounded-field border border-fault/30 bg-fault/5 px-3.5 py-2.5 text-xs text-fault"
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className="rounded-field border border-ok/30 bg-ok/5 px-3.5 py-2.5 text-xs text-ok"
            role="status"
          >
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 flex items-center justify-center gap-2 rounded-field bg-signal px-4 py-2.5 text-sm font-semibold text-terminal transition-colors hover:bg-[#5ce9ff] disabled:opacity-60"
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {mode === "signin" ? t.signinBtn : t.signupBtn}
        </button>
      </form>

      <p className="mt-5 text-center font-mono text-[11px] leading-relaxed text-faint">
        {t.passwordOnly}{" "}
        <Link href={home} className="hover:text-signal">
          {t.backHome}
        </Link>
      </p>
    </motion.div>
  );
}
