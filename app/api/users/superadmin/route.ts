import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  password_hash: string;
  role_id: number;
  restaurant_id: number | null;
  status: string;
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const {
      username,
      password,
    } = body;

    // Required fields
    if (!username || !password) {
      return NextResponse.json(
        {
          msg: "Username and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // Find user
    const [users] = await db.query<UserRow[]>(
      `
      SELECT *
      FROM tblusers
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    // User not found
    if (users.length === 0) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

  const user = users[0];

// Check status
if (user.status !== "active") {
  return NextResponse.json(
    {
      msg: "Your account is inactive",
    },
    {
      status: 403,
    }
  );
}

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        restaurantId: user.restaurant_id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // Response
    const response = NextResponse.json(
      {
        msg: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role_id: user.role_id,
          restaurant_id: user.restaurant_id,
        },
      },
      {
        status: 200,
      }
    );

    // JWT Cookie
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
      }
    );
  }
};