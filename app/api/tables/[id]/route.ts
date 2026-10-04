import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Table extends RowDataPacket {
  id: number;
  restaurant_id: number;
  table_number: number;
  capacity: number;
  status: string;
  created_at: Date;
}
export const PUT = async (req: NextRequest) => {
  try {
    // token
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }
    // verify token

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can update table" },
        { status: 403 },
      );
    }

    // get id
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ msg: "Invalid table id" }, { status: 400 });
    }

    // check
    const checkQuery = `
  SELECT
    id,
    restaurant_id,
    table_number,
    capacity,
    status
  FROM tbltables
  WHERE id = ?
    AND restaurant_id = ?
  LIMIT 1
`;

    const resultTable = await db.query<Table[]>(checkQuery, [
      id,
      verifyToken.restaurantId,
    ]);

    const dataTable: Table[] = resultTable[0];

    if (dataTable.length === 0) {
      return NextResponse.json({ msg: "Table not found" }, { status: 404 });
    }

    const body = await req.json();
    const { table_number, capacity, status } = body;
    if (!table_number || !capacity || !status) {
      return NextResponse.json(
        {
          msg: "Table number, capacity and status are required",
        },
        { status: 400 },
      );
    }

    const allowedStatus = ["available", "reserved", "occupied", "cleaning"];

    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { msg: "Invalid table status" },
        { status: 400 },
      );
    }

    // check table

    const checkTableQuery = `  SELECT id
      FROM tbltables
      WHERE restaurant_id = ?
      AND table_number = ?
      AND id = ?
      LIMIT 1`;

    const resultDublicate = await db.query<Table[]>(checkTableQuery, [
      verifyToken.restaurantId,
      table_number,
      id,
    ]);
    const dataDublicate = resultDublicate[0];
    if (dataDublicate.length > 0) {
      return NextResponse.json(
        { msg: "This table number already exists" },
        { status: 409 },
      );
    }

    // update Table

    const updateQuery = `
      UPDATE tbltables
      SET
        table_number = ?,
        capacity = ?,
        status = ?
      WHERE id = ?
      AND restaurant_id = ?
    `;

    await db.query(updateQuery, [
      table_number,
      capacity,
      status,
      id,
      verifyToken.restaurantId,
    ]);

    return NextResponse.json(
      {
        msg: "Table updated successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("UPDATE TABLE ERROR:", err);

    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};

// Delete Table
export const DELETE = async (req: NextRequest) => {
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
        { msg: "Only admin can delete table" },
        { status: 403 },
      );
    }

    // get Id
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ msg: "Invalid table id" }, { status: 400 });
    }

    const checkQuery = `
      SELECT id
      FROM tbltables
      WHERE id = ?
      AND restaurant_id = ?
      LIMIT 1
    `;

    const resultCheck = await db.query<Table[]>(checkQuery, [
      id,
      verifyToken.restaurantId,
    ]);
    const dataTable: Table[] = resultCheck[0];

    if (dataTable.length === 0) {
      return NextResponse.json({ msg: "Table not found" }, { status: 404 });
    }

    // Delete Query

    const deleteQuery = `DELETE FROM tbltables WHERE id=? AND restaurant_id = ?`;
    await db.query(deleteQuery, [id, verifyToken.restaurantId]);
    return NextResponse.json(
      {
        msg: "Table deleted successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("DELETE TABLE ERROR:", err);

    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};
