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

    // check admin
    if (!id) {
      return NextResponse.json(
        { msg: "Admin ID is required" },
        { status: 400 },
      );
    }

    // find admin

    const findAdminQuery = `SELECT id,name,username,phone FROM tbladmins WHERE id=? AND role_id=2`;

    const adminFind = await db.query<AdminData[]>(findAdminQuery, [id]);
    const findData = adminFind[0]
    console.log(findData);

    if(findData.length === 0){
         return NextResponse.json(
        { msg: "Admin not found" },
        { status: 404 },
      );
    }
    

      return NextResponse.json({
      msg: "Superadmin updated successfully",
    });
  } catch (err) {
    console.log("Error admin update");

    return NextResponse.json({ error: err }, { status: 500 });
  }
};
