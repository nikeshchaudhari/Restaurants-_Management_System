import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface AdminRow extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  password_hash: string;
  role_id: number;
  restaurant_id: number | null;
  status: "active" | "inactive";
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          msg: "Username and password are required",
        },
        {
          status: 400,
        },
      );
    }

    // Find Admin
    const [admins] = await db.query<AdminRow[]>(
      `
      SELECT *
      FROM tbladmins
      WHERE username = ?
      LIMIT 1
      `,
      [username],
    );

    if (admins.length === 0) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        },
      );
    }

    const admin = admins[0];

    // Check role
    if (admin.role_id !== 2) {
      return NextResponse.json(
        {
          msg: "Only restaurant admin can login",
        },
        {
          status: 403,
        },
      );
    }

    // Check status
    if (admin.status !== "active") {
      return NextResponse.json(
        {
          msg: "Admin account is inactive",
        },
        {
          status: 403,
        },
      );
    }

    // Check restaurant
    if (admin.restaurant_id === null) {
      return NextResponse.json(
        {
          msg: "Admin is not assigned to any restaurant",
        },
        {
          status: 400,
        },
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash,
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        },
      );
    }

    // Create JWT
    const token = jwt.sign(
      {
        adminId: admin.id,
        roleId: admin.role_id,
        restaurantId: admin.restaurant_id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    // Response
    const response = NextResponse.json(
      {
        msg: "Admin login successful",
        user: {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role_id: admin.role_id,
          restaurant_id: admin.restaurant_id,
        },
      },
      {
        status: 200,
      },
    );

    // Cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24*7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        msg: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
};