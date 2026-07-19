import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, startupApplicationsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

const CreateStartupApplicationBody = z.object({
  founderName: z.string().min(1),
  email: z.string().min(1).email(),
  registrationStatus: z.string().min(1),
  startupIdea: z.string().min(1),
  readiness: z.string().min(1),
  readinessDetail: z.string().default(""),
  ideaReason: z.string().min(1),
  experience: z.string().min(1),
  team: z.string().min(1),
});

const UpdateStartupResultBody = z.object({
  result: z.string().min(1),
  resultReason: z.string().optional(),
});

router.post("/startup-applications", async (req, res) => {
  const parsed = CreateStartupApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }
  const [created] = await db
    .insert(startupApplicationsTable)
    .values(parsed.data)
    .returning();
  req.log.info({ id: created.id }, "Startup application created");
  res.status(201).json(created);
});

router.get("/startup-applications", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(startupApplicationsTable)
    .orderBy(desc(startupApplicationsTable.createdAt));
  res.json(rows);
});

router.get("/startup-applications/:id", async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db
    .select()
    .from(startupApplicationsTable)
    .where(eq(startupApplicationsTable.id, id));
  if (!row) { res.status(404).json({ error: "Application not found" }); return; }
  res.json({
    id: row.id,
    founderName: row.founderName,
    result: row.result,
    resultReason: row.resultReason,
    createdAt: row.createdAt,
  });
});

router.patch("/startup-applications/:id/result", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const parsed = UpdateStartupResultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }
  const { result, resultReason } = parsed.data;
  const [updated] = await db
    .update(startupApplicationsTable)
    .set({ result, resultReason: resultReason ?? null })
    .where(eq(startupApplicationsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Application not found" }); return; }
  res.json(updated);
});

export default router;
