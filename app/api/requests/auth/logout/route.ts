import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "logged out" });

  response.cookies.delete("refresh_token");

  return response;
}
