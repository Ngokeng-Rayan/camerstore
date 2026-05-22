import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Routes protégées
  const isAdminRoute = path.startsWith("/admin");

  if (isAdminRoute) {
    const sessionCookie = request.cookies.get("session")?.value;

    // Pas de session -> Redirection vers /login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await decrypt(sessionCookie);

    // Jeton invalide -> Redirection vers /login
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Gestion du RBAC (Role-Based Access Control)
    // Si c'est un CLOSER, il n'a accès qu'aux commandes et livraisons
    if (payload.role === "CLOSER") {
      const allowedPaths = ["/admin/orders", "/admin/deliveries"];
      const isAllowed = allowedPaths.some(allowedPath => path.startsWith(allowedPath));

      if (!isAllowed) {
        // Rediriger le closer vers son CRM s'il essaie d'aller sur le Dashboard Admin
        return NextResponse.redirect(new URL("/admin/orders", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configurer le matcher pour ne faire tourner le middleware que sur certaines routes
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
