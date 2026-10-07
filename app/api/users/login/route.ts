/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface LoginUser extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  password_hash: string;
  role_id: number;
  restaurant_id: number | null;
  status: string;
  last_login_at: Date | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, password ,rememberMe} = body;

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

    let user: any = null;

    // check superadmin

    const superAdminQuery = ` SELECT
        id,
        name,
        username,
        phone,
        password_hash,
        role_id,
        status,
        last_login_at
      FROM tblsuperadmin
      WHERE username = ?
      LIMIT 1`;

    const result = await db.query<LoginUser[]>(superAdminQuery, [username]);

    const resultData = result[0];
    // console.log(resultData[0]);

    if (resultData.length > 0) {
      const users = resultData[0];
      user = users;
     
    }

    // admin

    if (!user) {
      const adminQuery = `
        SELECT
          id,
          name,
          username,
          phone,
          password_hash,
          role_id,
          restaurant_id,
          status,
          last_login_at
        FROM tbladmins
        WHERE username = ?
        LIMIT 1
      `;

      const adminResult = await db.query<LoginUser[]>(adminQuery, [username]);
      const dataAdmin = adminResult[0];
      if (dataAdmin.length > 0) {
        user = dataAdmin[0];
        
      }
    }

    // staff find

    if (!user) {
      const userQuery = `
        SELECT
          id,
          name,
          username,
          phone,
          password_hash,
          role_id,
          restaurant_id,
          status,
          last_login_at
        FROM tblusers
        WHERE username = ?
        LIMIT 1
      `;

      const userResult = await db.query<LoginUser[]>(userQuery, [username]);
      const dataUsers = userResult[0];
      if (dataUsers.length > 0) {
        user = dataUsers[0];

        
      }

      console.log(dataUsers[0]);
    }


    // last login update


if (user.role_id === 1) {
  await db.query(
    `
    UPDATE tblsuperadmin
    SET last_login_at = NOW()
    WHERE id = ?
    `,
    [user.id]
  );
} else if (user.role_id === 2) {
  await db.query(
    `
    UPDATE tbladmins
    SET last_login_at = NOW()
    WHERE id = ?
    `,
    [user.id]
  );
} else if (user.role_id === 3 || user.role_id === 4) {
  await db.query(
    `
    UPDATE tblusers
    SET last_login_at = NOW()
    WHERE id = ?
    `,
    [user.id]
  );
}
    // not found
    if (!user) {
      return NextResponse.json(
        {
          msg: "User Not Found !",
        },
        {
          status: 401,
        },
      );
    }

    // check Password

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { msg: "Invalid username or password" },
        { status: 401 },
      );
    }

    // check role

    if (![1, 2, 3, 4].includes(user.role_id)) {
      return NextResponse.json(
        {
          msg: "Invalid role",
        },
        {
          status: 403,
        },
      );
    }

    // create token
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        restaurantId: user.restaurant_id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: rememberMe?"30d":"1d",
      },
    );

    // cookies set
    let cookieName = "";
    if (user.role_id === 1) {
      cookieName = "super_token";
    } else if (user.role_id === 2) {
      cookieName = "admin_token";
    } else if (user.role_id === 3) {
      cookieName = "waiter_token";
    } else if (user.role_id === 4) {
      cookieName = "cashier_token";
    }

    const maxAge = rememberMe ?30*24*60*60 :24*60*60;

    const response = NextResponse.json({
      msg: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role_id: user.role_id,
        restaurant_id: user.restaurant_id,
      },
    });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        msg: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
