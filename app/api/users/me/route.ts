import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = async (req: NextRequest) => {
    const role = req.nextUrl.searchParams.get("role");
    console.log(role);
    
  try {
  } catch (err) {
    console.error("SESSION ERROR:", err);

    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
};
