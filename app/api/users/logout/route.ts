
// import { NextResponse } from "next/server";

// export async function POST() {
//   const response = NextResponse.json(
//     { msg: "Logout successful" },
//     { status: 200 },
//   );

//   const cookieNames = [
//     "super_token",
//     "admin_token",
//     "cashier_token",
//     "waiter_token",
//   ];

//   for (const name of cookieNames) {
//     response.cookies.set(name, "", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       expires: new Date(0),
//       path: "/",
//     });
//   }

//   return response;
// }