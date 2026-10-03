import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import cloudinary from "@/lib/cloudinary";
import { UploadApiResponse } from "cloudinary";

interface MenuRow extends RowDataPacket {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  stock: "available" | "not_available";
  status: "active" | "inactive";
}

export const PUT = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    // verifyTOken
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      roleId: number;
      restaurantId: number;
    };

    if (verifyToken.roleId !== 2) {
      return NextResponse.json(
        { msg: "Only admin can update menu" },
        { status: 403 },
      );
    }

    const url = new URL(req.url);
    const id = await url.pathname.split("/").pop();
    // console.log(id);
    if (!id) {
      return NextResponse.json({ msg: "Invalid menu id" }, { status: 400 });
    }

    // check menu

    const checkMenu = `SELECT *
      FROM tblmenu
      WHERE id = ?
        AND restaurant_id = ?
      LIMIT 1`;

    const resultMenu = await db.query<MenuRow[]>(checkMenu, [
      id,
      verifyToken.restaurantId,
    ]);
    const menuData = resultMenu[0];

    if (menuData.length === 0) {
      return NextResponse.json({ msg: "Menu not found" }, { status: 404 });
    }

    console.log(menuData);

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const stock = formData.get("stock") as string;
    const status = formData.get("status") as string;

    const image = formData.get("image") as File;

    if (!name || !price) {
      return NextResponse.json(
        { msg: "Name and price are required" },
        { status: 400 },
      );
    }

    if (stock && !["available", "not available"].includes(stock)) {
      return NextResponse.json(
        { msg: "Invalid availability" },
        { status: 400 },
      );
    }

    if (status && !["active", "inactive"].includes(status)) {
      return NextResponse.json({ msg: "Invalid status" }, { status: 400 });
    }

    // dublicate check

    const existMenuQuery = ` SELECT id
      FROM tblmenu
      WHERE restaurant_id = ?
        AND name = ?
        AND id != ?
      LIMIT 1`;

    const existData = await db.query<MenuRow[]>(existMenuQuery, [
      id,
      name,
      verifyToken.restaurantId,
    ]);
    const dataMenu = existData[0];

    if (dataMenu.length > 0) {
      return NextResponse.json(
        {
          msg: "This menu already exists in your restaurant",
        },
        { status: 409 },
      );
    }

    // image

    const maxSize = 2 * 1024 * 1024;

    if (image && image?.size > maxSize) {
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

    // buffer

    const bytes = await image.arrayBuffer();
    const buffer = await Buffer.from(bytes);

    const uploadFile:UploadApiResponse = await cloudinary.uploader
      .upload_stream(
        {
          folder: "restaurant-menu",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.log("Upload error:", error);
            return;
          }

          console.log("Upload result:", result);
          console.log("URL:", result?.secure_url);
          console.log("Public ID:", result?.public_id);
        },
      )
      .end(buffer);
      const uploadData = uploadFile[0]

console.log(uploadData.secure_url);

    return NextResponse.json(
      {
        msg: "Menu updated successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("UPDATE MENU ERROR:", err);

    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};
