import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

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
    const { name, username, phone, password, restaurant_id, status } = body;
    if (!id) {
      return NextResponse.json(
        { msg: "Admin ID is required" },
        { status: 400 },
      );
    }

    // find admin

    const findQuery = `SELECT id FROM tblusers WHERE id=? AND role_id = 3`;
    const findWaiter = await db.query<Data[]>(findQuery, [id]);
    const findData = findWaiter[0];
    console.log(findData);

    if (findData.length === 0) {
      return NextResponse.json({ msg: "Waiter not found" }, { status: 404 });
    }

    // update query
    const hashPassword = await bcrypt.hash(password, 10);

    const updateQuery = `UPDATE tblusers SET name = ?,username = ?,
        phone = ?,
        password_hash = ?,
        restaurant_id = ?,
        status = ? WHERE id =? AND role_id = 3`;

    await db.query(updateQuery, [
      name,
      username,
      phone,
      hashPassword,
      restaurant_id,
      status,
      id,
    ]);

    const detailsQuery = `SELECT id,name,username,phone,role_id,restaurant_id,status FROM tblusers WHERE id=? AND role_id=3 LIMIT 1`;
    const updateDetails = await db.query(detailsQuery, [id]);
    const updateData = updateDetails[0];

    return NextResponse.json(
      {
        msg: "ok",
        cashierData: updateData,
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

// delete Data

export const DELETE = async (req: NextRequest) => {
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

    if (!id) {
      return NextResponse.json(
        { msg: "Admin ID is required" },
        { status: 400 },
      );
    }

    // find Admin

    const findQuery = `SELECT id,name,username FROM tblusers WHERE id =? AND role_id =3`;
    const data = await db.query<Data[]>(findQuery, [id]);
    const allData = data[0];

    console.log(allData);

    if (allData.length === 0) {
      return NextResponse.json({ msg: "Waiter not found" }, { status: 404 });
    }

    // delete query 
    const deleteQuery = `DELETE FROM tblusers WHERE id =? AND role_id = 3`;
    await db.query(deleteQuery,[id]);

    return NextResponse.json(
      {
        msg: "Waiter deleted successfully",
        admin:data[0],
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
