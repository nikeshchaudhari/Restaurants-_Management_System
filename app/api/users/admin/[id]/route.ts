import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
interface AdminData extends RowDataPacket {
  id: number;
  role_id: number;
}

// Update Data

export const PUT = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const id = await url.pathname.split("/").pop();

    const body = await req.json();

    const { name, username, phone, password, restaurant_id, status } = body;

    // check admin
    if (!id) {
      return NextResponse.json(
        { msg: "Admin ID is required" },
        { status: 400 },
      );
    }

    // find admin

    const findAdminQuery = `SELECT id FROM tbladmins WHERE id=? AND role_id=2`;

    const adminFind = await db.query<AdminData[]>(findAdminQuery, [id]);
    const findData = adminFind[0];
    console.log(findData);

    if (findData.length === 0) {
      return NextResponse.json({ msg: "Admin not found" }, { status: 404 });
    }

    //hash password

    const hashPassword = await bcrypt.hash(password, 10);

    // update
    const updateQuery = `UPDATE tbladmins SET   name = ?,
        username = ?,
        phone = ?,
        password_hash = ?,
        restaurant_id = ?,
        status = ? WHERE id =? AND role_id = 2`;

    await db.query(updateQuery, [
      name,
      username,
      phone,
      hashPassword,
      restaurant_id,
      status,
      id,
    ]);

    return NextResponse.json(
      {
        msg: "Admin updated successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    console.log("Error admin update");

    return NextResponse.json({ error: err }, { status: 500 });
  }
};
