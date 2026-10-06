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
    // console.log(id);

    // check order
    const checkOrder = `SELECT * FROM tblorders WHERE id=? AND restaurant_id = ?
      LIMIT 1`;

    const resutlOrder = await db.query<tableData[]>(checkOrder, [
      id,
      verifyToken.restaurantId,
    ]);
    const orderData = resutlOrder[0];
    // console.log(orderData);

    if (orderData.length === 0) {
      return NextResponse.json({ msg: "Order not found" }, { status: 404 });
    }

    const body = await req.json();
    const { table_id, total_amount } = body;

    // table check
    const tableCheck = `SELECT id, restaurant_id FROM tbltables WHERE id=? AND restaurant_id = ?
      LIMIT 1`;
    
      const resultTable = await db.query<tableData[]>(tableCheck,[table_id, verifyToken.restaurantId]);
      const tableData = resultTable[0]

      console.log(tableData);

      if(tableData.length ===0){
          return NextResponse.json(
        {
          msg: "Table does not belong to this restaurant",
        },
        { status: 403 }
      );
      }
      

    // update Query
    const updateQuery = `UPDATE tblorders SET  table_id=?,total_amount=? WHERE id=? AND restaurant_id = ? LIMIT 1`;
    await db.query(updateQuery, [
      table_id,
      total_amount,
      id,
      verifyToken.restaurantId,
    ]);

    return NextResponse.json(
      {
        msg: "Order updated successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);

    return NextResponse.json(
      { msg: "Failed to update order" },
      { status: 500 },
    );
  }
};
