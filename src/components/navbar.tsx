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

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-terminal/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href={`/${lang}`} className="flex items-center gap-2.5" aria-label="NetLab">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Net<span className="text-signal">Lab</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <Link key={link.key} href={link.href} className="text-sm transition-colors hover:text-signal">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button onClick={signOut} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-static transition-colors hover:text-fault">
            <LogOut size={15} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-static hover:text-ink" aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
}