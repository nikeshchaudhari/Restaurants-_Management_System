import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("waiter_token")?.value;
  } catch (err) {
    console.error(err);

    return NextResponse.json({ msg: "Failed to create role" }, { status: 500 });
  }
};
