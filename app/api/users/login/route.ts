import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if ((users as any[]).length === 0) {
      return new Response("Invalid email or password", {
        status: 401,
      });
    }

    return new Response("Login successful");
  } catch (error) {
    console.error(error);

    return new Response("Login failed", {
      status: 500,
    });
  }
}