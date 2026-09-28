import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // verify token

    const verifyToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      userId: number;
      roleId: number;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only Admin can create Cahier" },
        { status: 403 },
      );
    }

    // get id from url

    const url = await new URL(req.url);
    const id = await url.pathname.split("").pop();

    if (!id) {
      if (!id) {
        return NextResponse.json({ msg: "ID is required" }, { status: 400 });
      }
    }

    

    const body = await req.json();

    const { name, username, phone, password, restaurant_id, status } = body;


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
