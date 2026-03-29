// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Define which roles are allowed for each top-level path
// Note: We don't need to list "ADMIN" everywhere if we handle them as a global override
const routePermissions: Record<string, string[]> = {
  "/hod": ["HOD"],
  "/accountant": ["ACCOUNTANT"],
  "/principal": ["PRINCIPAL"],
  "/vendor": ["VENDOR"],
  "/admin": ["ADMIN"],
  "/overview": ["HOD"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userProfileCookie = request.cookies.get("userProfile")?.value;

  console.log(pathname);
  // 1. If no cookie, redirect to login (root)
  if (!userProfileCookie) {
    // Prevent infinite redirect if already on login page
    if (pathname === "/") return NextResponse.next();
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const user = JSON.parse(userProfileCookie);
    const role = user.role;

    // 2. GLOBAL OVERRIDE: Admin can access everything
    if (role === "ADMIN") {
      return NextResponse.next();
    }

    // 3. Find if the current path is restricted
    const matchedRoute = Object.keys(routePermissions).find((route) =>
      pathname.startsWith(route),
    );

    if (matchedRoute) {
      const allowedRoles = routePermissions[matchedRoute];

      // 4. Role Check: If user role is NOT in the allowed list for this path
      if (!allowedRoles.includes(role)) {
        // Redirect logic for unauthorized access
        const dashboardMap: Record<string, string> = {
          HOD: "/overview",
          ACCOUNTANT: "/accountant",
          PRINCIPAL: "/principal",
          VENDOR: "/vendor",
        };

        const targetDestination = dashboardMap[role] || "/";

        // Prevent infinite loop if the user is already at their destination
        if (pathname.startsWith(targetDestination)) {
          return NextResponse.next();
        }

        return NextResponse.redirect(new URL(targetDestination, request.url));
      }
    }

    return NextResponse.next();
  } catch  {
    // Handle JSON parse errors or invalid cookies
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  // Ensure we match all relevant paths and their sub-paths
  matcher: [
    "/hod/:path*",
    "/accountant/:path*",
    "/principal/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/overview/:path*",
  ],
};
