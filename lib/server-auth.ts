import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "./supabase-admin";

export async function requireAuthenticatedUser(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new Error("Sign in is required.");
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("Your session has expired. Please sign in again.");
  return data.user;
}
