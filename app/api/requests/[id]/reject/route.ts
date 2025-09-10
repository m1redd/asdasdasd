import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/db";
import request from "@/lib/models/request";
import { getUserFromRequest } from "@/lib/jwt/middleware";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<
  | NextResponse<{ error: string }>
  | NextResponse<{ message: string; requestId: string }>
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

    await requests.deleteOne();

    return NextResponse.json({ message: "rejected", requestId: id });
  } catch (error) {
    console.error("Error rejecting", error);
    return NextResponse.json(
      { error: "internal err" },
      { status: 500 }
    );
  }
}
