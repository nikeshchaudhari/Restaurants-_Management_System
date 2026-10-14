
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
  console.log("PROXY RUNNING:", req.nextUrl.pathname);

  const token =
    req.cookies.get("super_token")?.value ||
    req.cookies.get("admin_token")?.value ||
    req.cookies.get("waiter_token")?.value ||
    req.cookies.get("cashier_token")?.value;


  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const verifyToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    if (verifyToken.roleId !== 1 && verifyToken.roleId !==2 && verifyToken.roleId !==3 && verifyToken.roleId !==4 ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [ "/dashboard/superadmin/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/staff/:path*",]
  
};
