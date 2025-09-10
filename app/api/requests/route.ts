import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/db";
import request from "@/lib/models/request";
import user from "@/lib/models/user";
import { genPassword, hashPassword } from "@/lib/utils/genPass";
import { getUserFromRequest } from "@/lib/jwt/middleware";

export async function POST(req: NextRequest) {
  await dbConnect();

  const currentUser = getUserFromRequest(req);
  if (currentUser) {
    return NextResponse.json(
      { error: "Already authenticated. Cannot create request" },
      { status: 400 }
    );
  }
  const body = await req.json();

  const {
    name,
    email,
    phone,
    about,
    role,
    passportNumber,
    directorApprovalUrl,
  } = body;
  if (!name || !email || !role) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const validRoles = ["admin", "researcher", "staff", "user"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "wrong role" }, { status: 400 });
  }

  if (role === "researcher" && (!passportNumber || !directorApprovalUrl)) {
    return NextResponse.json(
      {
        error: "missing researcher fields",
      },
      { status: 400 }
    );
  }

  const existingUser = await user.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const existingRequest = await request.findOne({ email, status: "pending" });
  if (existingRequest) {
    return NextResponse.json({ error: "req already exists" }, { status: 409 });
  }

  const generatedPassword = genPassword();
  const hashedPassword = await hashPassword(generatedPassword);

  const reqDoc = await request.create({
    name,
    email,
    phone,
    about,
    role,
    passportNumber,
    directorApprovalUrl,
    passwordHash: hashedPassword,
    status: "pending",
  });

  return NextResponse.json({ id: reqDoc._id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(req);
    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.role !== "staff")
    ) {
      return NextResponse.json(
        {
          error:
            "not enough permissions. only admin/staff can approve requests",
        },
        { status: 403 }
      );
    }
    const requests = await request.find().sort({ createdAt: -1 }).limit(200);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
