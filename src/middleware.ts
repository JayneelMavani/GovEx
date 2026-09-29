import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
  }

  // Protect researcher routes
  if (pathname.startsWith("/researcher")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=/researcher", req.url)
      );
    }
    if (user.role !== "ADMIN" && user.role !== "RESEARCHER") {
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/researcher/:path*"],
};
