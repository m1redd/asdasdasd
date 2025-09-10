import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/db";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt/jwt";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "user not found" }, { status: 401 });
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = signRefreshToken(user._id.toString());

    const response = NextResponse.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Internal server err" },
      { status: 500 }
    );
  }
}
