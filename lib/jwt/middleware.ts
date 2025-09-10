import { NextRequest } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";

export type UserRole = "admin" | "researcher" | "staff" | "user";


export function getAccessTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}


export function verifyToken(token: string): JWTPayload | null {
  try {
    return verifyAccessToken(token);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = getAccessTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function checkUserRole(
  req: NextRequest,
  requiredRole: UserRole
): JWTPayload | null {
  const user = getUserFromRequest(req);
  if (!user) return null;
  if (user.role !== requiredRole) return null;
  return user;
}

export function checkUserRoles(
  req: NextRequest,
  requiredRoles: UserRole[]
): JWTPayload | null {
  const user = getUserFromRequest(req);
  if (!user) return null;
  if (!requiredRoles.includes(user.role as UserRole)) return null;
  return user;
}
