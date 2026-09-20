import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const middeware = async (req: NextRequest) => {
  const token = await req.cookies.get("token")?.value;

  // check token
  if (!token) {
    return NextResponse.json(
      {
        msg: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const verifyToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      userId: number;
      roleId: number;
      restaurantId: number | null;
    };
    console.log(verifyToken);

    // only superadmin

    if (req.nextUrl.pathname.startsWith("/api/superadmin")) {
      if (verifyToken.roleId !== 1) {
        return NextResponse.json({ msg: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.log("error");

    return NextResponse.json(
      {
        error: err,
      },
      {
        status: 500,
      },
    );
  }
};
