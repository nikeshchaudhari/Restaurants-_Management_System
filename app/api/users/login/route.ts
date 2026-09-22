import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const {
      username,
      password,
    } = body;

    // Check required fields
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
    const query =
      "SELECT * FROM tblusers WHERE username = ? LIMIT 1";

    const findUser: any = await db.query(
      query,
      [username]
    );

    // User not found
    if (findUser[0].length === 0) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    const user = findUser[0][0];
    console.log(user);
    

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
        expiresIn: "1d",
      }
    );

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

    // Save JWT in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 *60*7,
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