import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, verifySession } from "./lib/auth/token";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Оптимистичная проверка: окончательная проверка сессии — в layout админки и в server actions.
    if (pathname === "/admin/login") return NextResponse.next();
    const ok = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intl(request);
}

export const config = {
  // Всё, кроме API, служебных файлов Next.js и файлов со статическими расширениями.
  matcher: ["/((?!api|_next|_vercel|uploads|icon|apple-icon|.*\\..*).*)"],
};
