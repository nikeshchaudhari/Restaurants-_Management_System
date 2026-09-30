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
        },
      );
    }

    let user: LoginUser | null = null;

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
    console.log(resultData);

    if (resultData.length > 0) {
      const user = resultData[0];
      return NextResponse.json({
        msg: "Data",
        user: user,
      });
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

      const adminResult = await db.query<LoginUser[]>(adminQuery,[username]);
      const dataAdmin = adminResult[0];
      if(dataAdmin){
        const dataUser = dataAdmin[0];

        return NextResponse.json(
          {
            msg:"admin data",
            dataUser:dataUser
          }
        )


      }
    }

    return NextResponse.json({ msg: "success" });
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
