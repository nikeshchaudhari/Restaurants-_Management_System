import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // Check username and password
    const { username, password } = body;

    //  Check username
    const checkQuery =
      "SELECT * FROM tblusers WHERE username = ? LIMIT 1";

    const [users]: any = await db.query(
      checkQuery,
      [username]
    );

    // Username not found
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

    // Get user
    const user = users[0];

    //  Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    // Password incorrect
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

    //  Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        restaurantId: user.restaurant_id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    // Create response
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

    // Store token in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24*7,
      path: "/",
    });

    return response;

  } catch (error) {
    console.log(error);

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