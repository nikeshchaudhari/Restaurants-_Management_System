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

    const { username, password } = body;

    
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

    let user: LoginUser | null = null;

//    check superadmin

    const [superadmins] = await db.query<LoginUser[]>(
      `
      SELECT
        id,
        name,
        username,
        phone,
        password_hash,
        role_id,
        NULL AS restaurant_id,
        status,
        last_login_at
      FROM tblsuperadmin
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    if (superadmins.length > 0) {
      user = superadmins[0];
    }

    // =====================================
    // 2. Check Admin
    // =====================================

    if (!user) {
      const [admins] = await db.query<LoginUser[]>(
        `
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
        `,
        [username]
      );

      if (admins.length > 0) {
        user = admins[0];
      }
    }

    // =====================================
    // 3. Check Cashier / Waiter
    // =====================================

    if (!user) {
      const [users] = await db.query<LoginUser[]>(
        `
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
        `,
        [username]
      );

      if (users.length > 0) {
        user = users[0];
      }
    }

    // =====================================
    // 4. User not found
    // =====================================

    if (!user) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================
    // 5. Check account status
    // =====================================

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

    // =====================================
    // 6. Check password
    // =====================================

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

    // =====================================
    // 7. Update last login
    // =====================================

    if (user.role_id === 1) {
      // Superadmin

      await db.query(
        `
        UPDATE tblsuperadmin
        SET last_login_at = NOW()
        WHERE id = ?
        `,
        [user.id]
      );
    } else if (user.role_id === 2) {
      // Admin

      await db.query(
        `
        UPDATE tbladmins
        SET last_login_at = NOW()
        WHERE id = ?
        `,
        [user.id]
      );
    } else {
      // Cashier / Waiter

      await db.query(
        `
        UPDATE tblusers
        SET last_login_at = NOW()
        WHERE id = ?
        `,
        [user.id]
      );
    }

    // =====================================
    // 8. Create JWT token
    // =====================================

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

    // =====================================
    // 9. Decide dashboard
    // =====================================

    let dashboard = "";

    switch (user.role_id) {
      case 1:
        dashboard = "/superadmin/dashboard";
        break;

      case 2:
        dashboard = "/admin/dashboard";
        break;

      case 3:
        dashboard = "/cashier/dashboard";
        break;

      case 4:
        dashboard = "/waiter/dashboard";
        break;

      default:
        return NextResponse.json(
          {
            msg: "Invalid role",
          },
          {
            status: 403,
          }
        );
    }

    // =====================================
    // 10. Create response
    // =====================================

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

        dashboard,
      },
      {
        status: 200,
      }
    );

    // =====================================
    // 11. Save JWT in cookie
    // =====================================

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
      }
    );
  }
}