import db from "@/lib/db";

export async function GET() {
  try {
    await db.query("SELECT 1 ");

    return new Response("connected");
  } catch (err) {
    console.log(err);
    
    return new Response(" connection failed", {
      status: 500,
    });
  }
}