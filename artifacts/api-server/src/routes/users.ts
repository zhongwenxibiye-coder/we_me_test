import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function supabaseAdminHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    "apikey": SERVICE_ROLE_KEY,
  };
}

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: supabaseAdminHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      req.log.error({ status: response.status, body: text }, "Supabase admin users error");
      res.status(502).json({ error: "Failed to fetch users" });
      return;
    }
    const data = await response.json() as { users: unknown[] };
    res.json(data.users ?? []);
  } catch (err) {
    req.log.error(err, "users route error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAdmin, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: supabaseAdminHeaders(),
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: (data as { msg?: string }).msg ?? "Failed to create user" });
      return;
    }
    res.status(201).json(data);
  } catch (err) {
    req.log.error(err, "create user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: supabaseAdminHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      req.log.error({ status: response.status, body: text }, "delete user error");
      res.status(502).json({ error: "Failed to delete user" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "delete user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
