import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";

interface Restaurant extends RowDataPacket {
  id: number;
  name: string;
  address: string;
  phone: number;
}
export const POST = async (req: NextRequest) => {
  try {
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
