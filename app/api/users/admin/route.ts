import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  phone: string;
  password_hash: string;
  role_id: number;
  restaurant_id: number | null;
  status: number;
  last_login_at: Date | null;
}
export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { name, username, phone, password, restaurant_id } = body;

    // Check username
    const checkQuery = "SELECT id FROM tblusers WHERE username = ? LIMIT 1";

    const usernameCheck = await db.query<User[]>(checkQuery, [username]);

    if (usernameCheck[0].length > 0) {
      return NextResponse.json(
        {
          msg: "Username already registered",
        },
        {
          status: 409,
        },
      );
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Store Admin
    const query = `
      INSERT INTO tblusers
      (name, username, phone, password_hash, role_id, restaurant_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      name,
      username,
      phone,
      hashPassword,
      2, 
      restaurant_id,
      1, 
    ]);

    return NextResponse.json(
      {
        msg: "Admin created successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);

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
