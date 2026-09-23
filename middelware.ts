import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const middlware = async (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }

  try {
    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    // only superAdmin

    if (verifyToken.roleId !== 1) {
      return NextResponse.json(
        { msg: "Only Super Admin can create Admin and  access this" },
        { status: 403 },
      );
    }

    console.log(verifyToken);

    return NextResponse.next();
  } catch (err) {
    console.log("Error");

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

export const config = {
  matcher: ["/api/users/superadmin/:path*"],
};
