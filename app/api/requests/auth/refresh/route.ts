import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/db";
import User from "@/lib/models/user";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt/jwt";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);
    const response = NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );

    response.cookies.delete("refresh_token");
    return response;
  }
}
