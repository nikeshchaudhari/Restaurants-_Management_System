import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const username = body.username;
    const password = body.password;

    const query =
      "SELECT * FROM tblusers WHERE username = ? LIMIT 1";

    const findUser = await db.query(query, [username,password]);

    console.log("DB RESULT:", findUser);

    if (Array.isArray(findUser[0]) && findUser[0].length === 0) {
      return NextResponse.json(
        {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    const user = findUser[0];

    console.log("USER:", user);

    return NextResponse.json({
      msg: "User found",
    });


    // match password
    
    const isMatch = await bcrypt.compare(password,user.password_hash);

    if(!isMatch){
      return NextResponse.json(
         {
          msg: "Invalid username or password",
        },
        {
          status: 401,
        }
      )
    }

    


   

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        msg: "Internal Server Error",
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
};
