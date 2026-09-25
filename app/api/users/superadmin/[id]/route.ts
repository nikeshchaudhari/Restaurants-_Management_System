import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface superAdminData extends RowDataPacket {
  id: number;
  role_id: number;
}

export const DELETE = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);

    const id = url.pathname.split("/").pop();
    console.log(id);

    if (!id) {
      return NextResponse.json(
        { msg: "SuperAdmin ID is required" },
        { status: 400 },
      );
    }

    // superadmin find
    const query = `SELECT id, name,  username
       FROM tblusers WHERE id=? AND role_id = 1 LIMIT 1 `;

    const superAdmin = await db.query<superAdminData[]>(query, [id]);
    const adminData = superAdmin[0][0];

    if (adminData.length === 0) {
      return NextResponse.json(
        { msg: "Superadmin not found" },
        { status: 404 },
      );
    }

    // delte data

    const deleteQuery = `DELETE from tblusers WHERE id =? AND role_id =1`;

    await db.query(deleteQuery,[id]);
    return NextResponse.json(
        {msg: "Superadmin deleted successfully"},
        {
             status: 200 
        }
    )

    return NextResponse.json(
      { msg: "SuperAdmin deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.log("error");
    return NextResponse.json(
      {
        error: err,
      },
      { status: 500 },
    );
  }
};
