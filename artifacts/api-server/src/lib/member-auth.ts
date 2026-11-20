import type { Request } from "express";

export async function authenticatedMemberId(req: Request): Promise<string | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ") || header.length > 10000) return null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Member authentication unavailable");
  // Verify with the project's existing auth service. Never trust a decoded JWT or a client user ID.
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: header, apikey: key },
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("Member authentication unavailable");
  const user = await response.json() as { id?: string; is_anonymous?: boolean; email_confirmed_at?: string };
  if (!user.id || user.is_anonymous || !user.email_confirmed_at) return null;
  return user.id;
}
