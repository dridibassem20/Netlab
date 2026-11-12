import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { locales, type Lang } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionaries";
import { LoginForm } from "./login-form";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (locales as readonly string[]).includes(raw) ? (raw as Lang) : "fr";
  return {
    title: lang === "fr" ? "Connexion" : "Sign in",
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }: PageProps) {
  const { lang: raw } = await params;
  if (!(locales as readonly string[]).includes(raw)) notFound();
  const lang = raw as Lang;
  const t = getDict(lang).login;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="bg-grid grid-fade absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <Suspense fallback={null}>
          <LoginForm lang={lang} t={t} />
        </Suspense>
      </div>
    </div>
  );
}
