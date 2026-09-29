import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface Data extends RowDataPacket {
  id: number;
  role_id: number;
}

export const PUT = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // verifyToken

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

    const url = new URL(req.url);
    const id = await url.pathname.split("/").pop();

    const body = await req.json();
    const { name, username, phone, assword, restaurant_id, status } = body;
    if (!id) {
      return NextResponse.json(
        { msg: "Admin ID is required" },
        { status: 400 },
      );
    }

    // find admin

    const findQuery = `SELECT id FROM tblusers WHERE id=? AND role_id = 3`;
     const findCashier = await db.query<Data[]>(findQuery, [id]);
    const findData = findCashier[0];
    console.log(findData);


    if (findData.length === 0) {
      return NextResponse.json({ msg: "Cashier not found" }, { status: 404 });
    }



       return NextResponse.json(
      {
        msg:"ok"
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
