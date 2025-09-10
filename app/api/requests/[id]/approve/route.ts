import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/db";
import request from "@/lib/models/request";
import user from "@/lib/models/user";
import { genPassword, hashPassword } from "@/lib/utils/genPass";
import { sendEmail, generatePasswordEmail } from "@/lib/utils/mail";
import { getUserFromRequest } from "@/lib/jwt/middleware";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<
  | NextResponse<{ error: string }>
  | NextResponse<{ message: string; userId: string }>
> {
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

    const { id } = await context.params;
    const requests = await request.findById(id);

    if (!requests) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const existingUser = await user.findOne({ email: requests.email });
    if (existingUser) {
      await requests.deleteOne();
      return NextResponse.json(
        { error: "user already exists" },
        { status: 409 }
      );
    }

    const pendingRequest = await request.findOne({
      email: requests.email,
      status: "pending",
      _id: { $ne: id },
    });

    if (pendingRequest) {
      return NextResponse.json(
        { error: "there's already an request fo this user" },
        { status: 409 }
      );
    }

    const generatedPassword = genPassword();
    const hashedPassword = await hashPassword(generatedPassword);

    const users = await user.create({
      name: requests.name,
      email: requests.email,
      phone: requests.phone,
      about: requests.about,
      role: requests.role,
      passportNumber: requests.passportNumber,
      directorApprovalUrl: requests.directorApprovalUrl,
      passwordHash: hashedPassword,
    });

    let emailSent = false;
    try {
      emailSent = await sendEmail({
        to: requests.email,
        subject: "Account approved",
        html: generatePasswordEmail(requests.name, generatedPassword),
      });
    } catch (emailError) {
      console.warn("Err sending email:", emailError);
    }

    await requests.deleteOne();

    return NextResponse.json({
      message: "approved",
      userId: users._id,
      generatedPassword,
      emailSent,
    });
  } catch (error) {
    console.error("Error approving", error);
    return NextResponse.json(
      { error: "internal err" },
      { status: 500 }
    );
  }
}
