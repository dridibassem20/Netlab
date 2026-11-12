import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { locales, type Lang } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionaries";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#0a0f16",
};

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (locales as readonly string[]).includes(raw) ? (raw as Lang) : "fr";
  const t = getDict(lang).meta.home;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t.title,
      template: "%s · NetLab",
    },
    description: t.description,
    openGraph: {
      type: "website",
      siteName: "NetLab",
      title: t.title,
      description: t.description,
      url: siteUrl,
      locale: lang === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
    },
  };
}

export default async function SiteLayout({ children, params }: LangLayoutProps) {
  const { lang: raw } = await params;
  if (!(locales as readonly string[]).includes(raw)) notFound();
  const lang = raw as Lang;

  return (
    <html lang={lang} className="dark">
      <body className={`${inter.variable} ${display.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
