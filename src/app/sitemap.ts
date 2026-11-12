import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { locales } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticPaths = [
    { path: "", priority: 1, freq: "weekly" as const },
    { path: "/subnet", priority: 0.9, freq: "monthly" as const },
    { path: "/formulas", priority: 0.9, freq: "monthly" as const },
    { path: "/quiz", priority: 0.8, freq: "monthly" as const },
    { path: "/blog", priority: 0.8, freq: "weekly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const lang of locales) {
    for (const { path, priority, freq } of staticPaths) {
      entries.push({
        url: `${base}/${lang}${path}`,
        changeFrequency: freq,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
        },
      });
    }
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    for (const lang of locales) {
      for (const p of data ?? []) {
        entries.push({
          url: `${base}/${lang}/blog/${p.slug}`,
          lastModified: new Date(p.created_at),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB unreachable (e.g. build without env vars) — static routes still ship.
  }

  return entries;
}
