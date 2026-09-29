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
export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // verify token

    const verifyToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    // only admin create cashier

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can create cashier" },
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

    // check username cashier

    const checkQuery = `SELECT id FROM tblusers WHERE username =? LIMIT 1`;

    const findUserName = await db.query<AdminRow[]>(checkQuery, [username]);

    const dataFind = findUserName[0];

    if (dataFind.length > 0) {
      return NextResponse.json(
        { msg: "Username already exists" },
        { status: 409 },
      );
    }

    // hash
    const hashPassword = await bcrypt.hash(password, 10);
    // insert cahier data

    const createQuery = ` INSERT INTO tblusers
      (
        name,
        username,
        phone,
        password_hash,
        role_id,
        restaurant_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const data = await db.query<ResultSetHeader>(createQuery, [
      name,
      username,
      phone,
      hashPassword,
      3,
      verifyToken.restaurantId,
      "active",
    ]);

    const result = data[0];

    return NextResponse.json(
      {
        msg: "Cashier created successfully",
        cashier: {
          id: result.insertId,
          name,
          username,
          phone,
          role_id: 3,
          restaurant_id: verifyToken.restaurantId,
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

// get Data

export const GET = async (req: NextRequest) => {
  try {
    const token = await req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // verifytoken

    const verifyToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      adminId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can access this" },
        { status: 403 },
      );
    }
    // get users only admin

    const query = ` SELECT
    id,
    name,
    username,
    phone,
    role_id,
    restaurant_id
  FROM tblusers
  WHERE restaurant_id = ?
  ORDER BY id DESC`;

  const resultData = await db.query(query,[verifyToken.restaurantId]);

  const data = resultData[0]


    return NextResponse.json(
      {
        msg: "Data fetched successfully",
        data:{
          resultData:data
        }
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { msg: "Invalid or expired token" },
      { status: 500 },
    );
  }
};
