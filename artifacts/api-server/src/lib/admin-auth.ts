import type { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    req.log.error("ADMIN_PASSWORD env var is not set");
    res.status(500).json({ error: "Server misconfigured" });
    return;
  }
  const provided = req.header("x-admin-password");
  if (!provided || provided !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
