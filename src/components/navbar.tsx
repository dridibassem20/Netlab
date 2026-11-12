"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LOCALE_COOKIE, type Lang } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import type { Dict } from "@/lib/i18n/dictionaries";

export function Navbar({
  lang,
  t,
}: {
  lang?: Lang;
  t: Dict["nav"];
}) {
  const defaultNav: Dict["nav"] = {
    subnet: "Subnet",
    formulas: "Formulas",
    quiz: "Quiz",
    blog: "Blog",
    signIn: "Sign in",
    admin: "admin",
    signOut: "Sign out",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langLabel: "Language",
  };

  const LINKS = [
    { href: `/${lang}/subnet`, label: t.subnet, key: "subnet" },
    { href: `/${lang}/formulas`, label: t.formulas, key: "formulas" },
    { href: `/${lang}/quiz`, label: t.quiz, key: "quiz" },
    { href: `/${lang}/blog`, label: t.blog, key: "blog" },
  ];

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ name: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (mounted) setSession(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .single();
      if (mounted) {
        setSession({
          name: profile?.display_name || user.email?.split("@")[0] || "student",
          isAdmin: profile?.role === "admin",
        });
      }
    };

    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    router.push(`/${lang}`);
    router.refresh();
  };

  const switchLang = (target: Lang) => {
    document.cookie = `${LOCALE_COOKIE}=${target};path=/;max-age=31536000;samesite=lax`;
    const segs = window.location.pathname.split("/");
    segs[1] = target;
    router.push(segs.join("/") || `/${target}`);
  };

  const langClass = lang === "fr"
    ? "bg-signal/15 text-signal"
    : "text-faint hover:text-static";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-terminal/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href={`/${lang}`} className="flex items-center gap-2.5" aria-label="NetLab">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Net<span className="text-signal">Lab</span>
          </span>
        </Link>

<div className="flex items-center gap-2">
          {/* Language switcher - always visible, premium pills */}
          <div role="group" aria-label={t.langLabel} className="gap-1">
            {["fr", "en"].map((code) => {
              const lang = code as Lang;
              const isActive = lang === lang;
              return (
                <button
                  key={lang}
                  onClick={() => switchLang(lang)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex-1 rounded-full px-3 py-1.5 text-[10px] uppercase font-mono transition-colors",
                    isActive ? "bg-signal/20 text-signal" : "text-static hover:text-signal",
                    "hover:bg-signal/10",
                  )}
                >
                  {lang}
                </button>
              );
            })}
          </div>

          {session ? (
            <>
              {session.isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-static transition-colors hover:border-signal/40 hover:text-signal"
                >
                  {t.admin}
                </Link>
              )}
              <span className="max-w-[120px] truncate font-mono text-xs text-faint" title={session.name}>
                {session.name}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-static transition-colors hover:text-fault"
                aria-label={t.signOut}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link
              href={`/${lang}/login`}
              className="rounded-lg border border-signal/40 bg-signal/10 px-3.5 py-1.5 text-sm font-medium text-signal transition-colors hover:bg-signal/20"
            >
              {t.signIn}
            </Link>
          )}
        </div>

        {/* Desktop navigation links */}
        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="relative rounded-lg px-3.5 py-2 text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile burger menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-static hover:text-ink"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-terminal/90 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-5">
              {LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                {session ? (
                  <>
                    {session.isAdmin && (
                      <Link
                        href="/admin"
                        className="rounded-lg px-3 py-2 font-mono text-xs text-signal"
                      >
                        {t.admin}
                      </Link>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs text-faint">
                        {session.name}
                      </span>
                      <button
                        onClick={signOut}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-static hover:text-fault"
                      >
                        <LogOut size={15} /> {t.signOut}
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href={`/${lang}/login`}
                    className="block rounded-lg border border-signal/40 bg-signal/10 px-3 py-2.5 text-center text-sm font-medium text-signal"
                  >
                    {t.signIn}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}