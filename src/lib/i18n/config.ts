export const locales = ["fr", "en"] as const;
export type Lang = (typeof locales)[number];

export const defaultLocale: Lang = "fr";

export const LOCALE_COOKIE = "netlab_lang";

export function isLang(value: string): value is Lang {
  return (locales as readonly string[]).includes(value);
}

/** Picks the UI language from cookie → Accept-Language → default. */
export function detectLang(acceptLanguage?: string, cookie?: string | null): Lang {
  if (cookie && isLang(cookie)) return cookie;
  if (acceptLanguage) {
    const parts = acceptLanguage
      .split(",")
      .map((p) => {
        const [tag, q] = p.trim().split(";q=");
        return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);
    for (const { tag } of parts) {
      if (tag.startsWith("fr")) return "fr";
      if (tag.startsWith("en")) return "en";
    }
  }
  return defaultLocale;
}
