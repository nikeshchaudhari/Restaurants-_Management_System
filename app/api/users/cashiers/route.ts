import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ResultSetHeader } from "mysql2";
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

// Create Waiter

export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const verifyToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    // only admin create waiter

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can create waiter" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const { name, username, phone, password } = body;
    if (!name || !username || !phone || !password) {
      return NextResponse.json(
        { msg: "All fields are required" },
        { status: 400 },
      );
    }

    // check username

    const check = `SELECT id FROM tblusers WHERE username =? LIMIT 1`;
    const findUserName = await db.query<AdminRow[]>(check, [username]);
    const dataFind = findUserName[0];

    if (dataFind.length > 0) {
      return NextResponse.json(
        { msg: "Username already exists" },
        { status: 409 },
      );
    }

    // hash
    const hashPassword = await bcrypt.hash(password, 10);

    // insert waiter data

    const createQuery = ` INSERT INTO tblusers
      (
        name,
        username,
        phone,
        password_hash,
        role_id,
        restaurant_id,
        admin_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    const result = await db.query<ResultSetHeader>(createQuery, [
      name,
      username,
      phone,
      hashPassword,
      4,
      verifyToken.restaurantId,
      verifyToken.userId,
      "active",
    ]);

    
    const resultData = result[0];

     return NextResponse.json(
      {
        msg: "Cashiers created successfully",
        cashier: {
          id: resultData.insertId,
          name,
          username,
          phone,
          role_id: 4,
          restaurant_id: verifyToken.restaurantId,
          admin_id:verifyToken.userId,
          status: "active",
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.log("Error");
    return NextResponse.json(
      {
        error: err,
      },
      { status: 500 },
    );
  }
};

