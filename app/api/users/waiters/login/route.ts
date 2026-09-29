import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {

    
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
