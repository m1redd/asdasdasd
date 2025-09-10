import crypto from "crypto";
import bcrypt from "bcryptjs";

export function genPassword(): string {
  return crypto
    .randomBytes(8)
    .toString("base64")
    .replace(/[+/=]/g, (char) => {
      const replacements: { [key: string]: string } = {
        "+": "A",
        "/": "B",
        "=": "C",
      };
      return replacements[char] || char;
    })
    .slice(0, 12);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
