import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface Data extends RowDataPacket{

   id: number;
  name: string;
  username: string;
  phone: string | null;
  password_hash: string;
  role_id: number;
  restaurant_id: number | null;
  status: string;
  last_login_at: Date | null;
}
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { username, password } = body;

    // 2. Validate
    if (!username || !password) {
      return NextResponse.json(
        {
          msg: "Username and password are required",
        },
        {
          status: 400,
        },
      );
    }

    const findQuery =  `SELECT  id,
        name,
        username,
        phone,
        password_hash,
        role_id,
        restaurant_id,
        status,
        last_login_at  FROM tblusers WHERE username =? LIMIT 1`;


    const result= await db.query<Data[]>(findQuery,[username]);

    const data = result[0];
    if(data.length === 0){
       return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

  } catch (err) {
    console.log("Error Login waiter");

    return NextResponse.json(
      {
        error: err,
      },
      {
        status: 500,
      },
    );
  }
};
