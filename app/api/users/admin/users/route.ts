import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db"
type UserRow = RowDataPacket & {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  role_id: number;
  restaurant_id: number;
  admin_id: number;
  status: number;
};

export const GET = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const verifyToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    // Only Admin
    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can access this" },
        { status: 403 }
      );
    }

    const query = `
      SELECT
        id,
        name,
        username,
        phone,
        role_id,
        restaurant_id,
        admin_id,
        status
      FROM tblusers
      WHERE admin_id = ?
        AND restaurant_id = ?
      ORDER BY id DESC
    `;

    const [data] = await db.query<UserRow[]>(
      query,
      [
        verifyToken.userId,
        verifyToken.restaurantId,
      ]
    );

    return NextResponse.json(
      {
        msg: "Data fetched successfully",
        data,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      { msg: "Invalid or expired token" },
      { status: 401 }
    );
  }
};