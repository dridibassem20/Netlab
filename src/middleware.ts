import { type NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/supabase/middleware";
import { detectLang, LOCALE_COOKIE } from "@/lib/i18n/config";

/**
 * Order of business:
 *  1. /admin — auth guard first (redirects to /{lang}/login?next=/admin)
 *  2. locale prefix — every bare path is prefixed with /fr or /en
 *     (cookie → Accept-Language → default), assets excluded by the matcher
 *  3. locale paths — refresh the Supabase session; logged-in users are
 *     bounced from /{lang}/login back to /{lang}
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pickLang = () =>
    detectLang(
      request.headers.get("accept-language") ?? undefined,
      request.cookies.get(LOCALE_COOKIE)?.value,
    );

  /* ── 1. admin guard (no locale prefix — admin stays at /admin) ── */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const { response, user } = await refreshSession(request);
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${pickLang()}/login`;
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  /* ── 2. add the locale prefix ────────────────────────────────── */
  const hasLocale =
    pathname === "/fr" ||
    pathname === "/en" ||
    pathname.startsWith("/fr/") ||
    pathname.startsWith("/en/");

  if (!hasLocale) {
    const lang = pickLang();
    const url = request.nextUrl.clone();
    url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  /* ── 3. locale path — session refresh + login bounce ─────────── */
  const { response, user } = await refreshSession(request);

  if (user && /\/login\/?$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathname.split("/")[1]}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything except static assets and image files.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
