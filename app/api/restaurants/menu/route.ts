import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface Data extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: string;
  restaurant_id: number;
  image_url: string;
  stock: string;
  status: "active" | "inactive";
}
export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // verify token
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number | null;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can add menu" },
        { status: 403 },
      );
    }

    // const body = await req.json();
    // const { name, description, price, image_url } = body;

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File;

    if (!name || !price || !image) {
      return NextResponse.json(
        { msg: "Name, price and image are required" },
        { status: 400 },
      );
    }

    const restaurantId = verifyToken.restaurantId;
    const menuQuery = `SELECT id FROM tblmenu WHERE restaurant_id = ? AND name =? LIMIT 1`;

    const existingMenu = await db.query<Data[]>(menuQuery, [
      restaurantId,
      name,
    ]);

    const existingData = existingMenu[0];

    if (existingData.length > 0) {
      return NextResponse.json(
        {
          msg: "This menu already exists in your restaurant",
        },
        { status: 409 },
      );
    }
    // size
    const maxSize = 2 * 1024 * 1024;

    if (image.size > maxSize) {
      return NextResponse.json(
        { msg: "Image size must be less than 2 MB" },
        { status: 400 },
      );
    }

    // allowed type photo
    const allowedType = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedType.includes(image.type)) {
      return NextResponse.json(
        { msg: "Only JPEG and PNG images are allowed" },
        { status: 400 },
      );
    }

    // buffer data

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // upload data
    const uploadFile = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "restaurant-menu",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(new Error("Image upload failed"));
                return;
              }

              resolve(result);
            },
          )
          .end(buffer);
      },
    );

    const imageUrl = uploadFile.secure_url;
    const imageId = uploadFile.public_id;

    const insertQuery = ` INSERT INTO tblmenu
  (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    imageId,
    stock,
    status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    await db.query(insertQuery, [
      restaurantId,
      name,
      description,
      price,
      imageUrl,
      imageId,
      "available",
      "active",
    ]);

    return NextResponse.json({
      msg: "data insert",
    });
  } catch (err) {
    console.log("Error");

    return NextResponse.json({
      error: err instanceof Error ? err.message : err,
    });
  }
};
