import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

// interface Restaurant extends RowDataPacket {
//   id: number;
//   name: string;
//   address: string;
//   phone: number;
// }
export const POST = async (req: NextRequest) => {
  try {
    const token = await req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId != 1) {
      return NextResponse.json(
        { msg: "Only superadmin can create hotel" },
        { status: 403 },
      );
    }
    const body = await req.json();
    const { name, address, phone } = body;

    if (!name) {
      return NextResponse.json(
        { msg: "Restaurant name is required" },
        { status: 400 },
      );
    }
    const query = `
      INSERT INTO tblrestaurants
      (name, address, phone)
      VALUES (?, ?, ?)
    `;

    const result = await db.query<ResultSetHeader>(query, [
      name,
      address,
      phone,
    ]);

    console.log(result);
    return NextResponse.json(
      {
        msg: "Restaurant created successfully",
        restaurantId: result[0].insertId,
      },
      { status: 201 },
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
