import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Restaurant extends RowDataPacket {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: number;
  created_at: Date;
}

interface JwtPayload {
  adminId: number;
  roleId: number;
  restaurantId: number;
}

export const GET = async (req: NextRequest) => {
  try {
    // Get token
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          msg: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        },
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    // Check Admin role
    if (decoded.roleId !== 2) {
      return NextResponse.json(
        {
          msg: "Only restaurant admin can access this",
        },
        {
          status: 403,
        },
      );
    }

    // Restaurant token
    const restaurantId = decoded.restaurantId;

    // only restaurant admin
    const [restaurants] = await db.query<Restaurant[]>(
      `
      SELECT *
      FROM tblrestaurants
      WHERE id = ?
      LIMIT 1
      `,
      [restaurantId],
    );

    if (restaurants.length === 0) {
      return NextResponse.json(
        {
          msg: "Restaurant not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        msg: "Restaurant details",
        restaurant: restaurants[0],
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        msg: "Invalid or expired token",
      },
      {
        status: 401,
      },
    );
  }
};