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
export const PUT = async (req: NextRequest) => {
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

    // get id
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    // check order
    const checkOrder = `SELECT * FROM tbltables WHERE id=? AND estaurant_id = ?
      LIMIT 1`;

    const resutlOrder = await db.query<tableData[]>(checkOrder, [
      id,
      verifyToken.restaurantId,
    ]);
    const orderData = resutlOrder[0];

    if (orderData.length === 0) {
      return NextResponse.json({ msg: "Order not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);

    return NextResponse.json(
      { msg: "Failed to update order" },
      { status: 500 },
    );
  }
};
