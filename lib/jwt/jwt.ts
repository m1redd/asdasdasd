import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const secret = process.env.JWT_SECRET as string;

if (!secret) {
  throw new Error("JWT_SECRET is not loaded");
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, secret) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, secret) as JWTPayload;
}
