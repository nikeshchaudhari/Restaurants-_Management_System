import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
interface Table extends RowDataPacket {
  id: number;
  restaurant_id: number;
  table_number: number;
  capacity: number;
  status: string;
  created_at: Date;
}
export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can add table" },
        { status: 403 },
      );
    }
    const body = await req.json();

    const { table_number, capacity } = body;

    if (!table_number) {
      return NextResponse.json(
        { msg: "Table number is required" },
        { status: 400 },
      );
    }

    if (!capacity) {
      return NextResponse.json(
        { msg: "Capacity is required" },
        { status: 400 },
      );
    }

    const checkQuery = `
      SELECT id
      FROM tbltables
      WHERE restaurant_id = ?
      AND table_number = ?
      LIMIT 1
    `;

    const existTable = await db.query<Table[]>(checkQuery, [
      verifyToken.restaurantId,
      table_number,
    ]);
    const existData = existTable[0];
    if (existData.length > 0) {
      return NextResponse.json(
        { msg: "This table already exists" },
        { status: 409 },
      );
    }

    console.log(existTable);

    // insertQuery

    const insertQuery = ` INSERT INTO tbltables
      (
        restaurant_id,
        table_number,
        capacity,
        status
      )
      VALUES (?, ?, ?, 'available')`;

    const result = await db.query<ResultSetHeader>(insertQuery, [
      verifyToken.restaurantId,
      table_number,
      capacity,
    ]);

    return NextResponse.json(
      {
        msg: "Table added successfully",
        data: {
          id: result[0].insertId,
          restaurant_id: verifyToken.restaurantId,
          table_number,
          capacity,
          status: "available",
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("ADD TABLE ERROR:", err);

    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};

// Get data
export const GET = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can view tables" },
        { status: 403 },
      );
    }
    const getTableQuery = `
      SELECT
        id,
        restaurant_id,
        table_number,
        capacity,
        status,
        created_at
      FROM tbltables
      WHERE restaurant_id = ?
      ORDER BY id DESC
    `;

    const getResult = await db.query(getTableQuery,[verifyToken.restaurantId]);
       return NextResponse.json(
      {
        msg: "Table data fetched successfully",
        data: getResult[0],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET TABLE ERROR:", err);

    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};
