import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface tableData extends RowDataPacket {
  restaurant_id: number;
  table_number: number;
  capacity: number;
  status: string;
}
export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("waiter_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId !== 3) {
      return NextResponse.json(
        { msg: "Only waiter can create order" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { table_id, total_amount } = body;
    if (!table_id || total_amount === undefined) {
      return NextResponse.json(
        {
          msg: "table_id and total_amount are required",
        },
        { status: 400 },
      );
    }

    // check table

    const checkTable = `SELECT * FROM tbltables WHERE id=? AND restaurant_id=? LIMIT 1`;

    const resultTable = await db.query<tableData[]>(checkTable, [
      table_id,
      verifyToken.restaurantId,
    ]);
    const tableData = resultTable[0];
    console.log("TABLE ID:", table_id);
    console.log("RESTAURANT ID:", verifyToken.restaurantId);
    console.log("TABLE DATA:", tableData);

    if (tableData.length === 0) {
      return NextResponse.json({ msg: "Table not found" }, { status: 404 });
    }

    // insert Data
    const inserQuery = `INSERT INTO tblorders (restaurant_id, total_amount, table_id)VALUES (?, ?, ?)`;
    await db.query(inserQuery, [
      verifyToken.restaurantId,
      total_amount,
      table_id,
    ]);

    return NextResponse.json({ msg: "Orders Data Insert" }, { status: 200 });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { msg: "Failed to create order" },
      { status: 500 },
    );
  }
};

// Self orders view Get Data

export const GET = async (req: NextRequest) => {
  try {
    const adminToken = req.cookies.get("admin_token")?.value;
    const waiterToken = req.cookies.get("waiter_token")?.value;
    const cashierToken = req.cookies.get("cashier_token")?.value;

    const token = adminToken || waiterToken || cashierToken;

    if (!token) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (![2, 3, 4].includes(verifyToken.roleId)) {
      return NextResponse.json(
        {
          msg: "You are not allowed to view orders",
        },
        {
          status: 403,
        },
      );
    }

    if (!verifyToken.restaurantId) {
      return NextResponse.json(
        {
          msg: "Restaurant not assigned",
        },
        {
          status: 400,
        },
      );
    }

    const getData = `SELECT o.id,o.restaurant_id,o.table_id,t.table_number,o.total_amount,o.created_at FROM tblorders o LEFT JOIN tbltables t ON o.table_id = t.id WHERE  o.restaurant_id = ? ORDER BY o.id DESC`;

    const resultData = await db.query(getData,[verifyToken.restaurantId]);
      return NextResponse.json(
      {
        msg: "Orders fetched successfully",
        data: resultData[0],
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        msg: "Failed to fetch orders",
      },
      {
        status: 500,
      },
    );
  }
};
