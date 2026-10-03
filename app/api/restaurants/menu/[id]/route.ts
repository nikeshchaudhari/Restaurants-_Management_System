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
  imageId: string;
  stock: "available" | "not available";
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

    const image = formData.get("image") as File | null;

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
        AND id = ?
      LIMIT 1`;

    const existData = await db.query<MenuRow[]>(existMenuQuery, [
      verifyToken.restaurantId,
      name,
      id,
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

    let imageUrl = menuData[0].image_url;
    let imageId = menuData[0].imageId;

    if (image) {
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

      console.log(uploadFile);

      imageUrl = uploadFile.secure_url;
      imageId = uploadFile.public_id;
    }

    // update query
    const updateQuery = `
  UPDATE tblmenu SET
    name = ?,
    description = ?,
    price = ?,
    image_url = ?,
    imageId = ?,
    stock = ?,
    status = ?
  WHERE id = ? AND restaurant_id = ?
`;

    await db.query(updateQuery, [
      name,
      description || null,
      price,
      imageUrl,
      imageId,
      stock || menuData[0].stock,
      status || menuData[0].status,
      id,
      verifyToken.restaurantId,
    ]);

    // return data

    const updateDetailsQuery = ` SELECT
        id,
        restaurant_id,
        name,
        description,
        price,
        image_url,
        stock,
        status,
        created_at  FROM tblmenu
      WHERE id = ?
        AND restaurant_id = ?`;

    const finalData = await db.query(updateDetailsQuery, [
      id,
      verifyToken.restaurantId,
    ]);

    return NextResponse.json(
      {
        msg: "Menu updated successfully",
        updatData: finalData[0],
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("UPDATE MENU ERROR:", err);

    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};
