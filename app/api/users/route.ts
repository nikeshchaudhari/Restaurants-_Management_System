import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // check username
    const checkQuery = "SELECT id FROM tblusers WHERE username = ? LIMIT 1";
    const usernameCheck= await db.query(checkQuery,[body.username]);

    if (Array.isArray(usernameCheck[0]) && usernameCheck[0].length > 0) {
      return NextResponse.json({
        msg:"Username already register..",
      },{
        status:409
      })
    }
    
    const hashPassword = await bcrypt.hash(body.password, 10);
    const users = {
      name: body.name,
      username: body.username,
      phone: body.phone,
      password: hashPassword,
      role_id: 1,
      restaurant_id: null,
      status: 1,
    };

    const query =
      "INSERT INTO tblusers(name,username,phone,password_hash,role_id,restaurant_id,status)VALUES(?,?,?,?,?,?,?)";

    await db.query(query, [
      users.name,
      users.username,
      users.phone,
      users.password,
      users.role_id,
      users.restaurant_id,

      users.status,
    ]);

    return Response.json({
      msg: "super_Admin Created sucessfully !!",
    },{
      status:200
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      msg: "Something went wrong",
    },{
      status:500
    });
  }
};
