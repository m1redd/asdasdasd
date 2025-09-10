import { NextRequest } from "next/server";
import { checkUserRole, checkUserRoles } from "./middleware";

export function isAdmin(req: NextRequest) {
  return checkUserRole(req, 'admin');
}

export function isStaffOrAdmin(req: NextRequest) {
  return checkUserRoles(req, ['admin', 'staff']);
}

export function isResearcherOrAbove(req: NextRequest) {
  return checkUserRoles(req, ['admin', 'staff', 'researcher']);
}

export function isAuthenticated(req: NextRequest) {
  return checkUserRoles(req, ['admin', 'staff', 'researcher', 'user']);
}