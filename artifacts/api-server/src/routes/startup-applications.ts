import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, startupApplicationsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.post("/startup-applications", async (req, res) => {
  const body = req.body as {
    founderName: string;
    email: string;
    registrationStatus: string;
    startupIdea: string;
    readiness: string;
    readinessDetail?: string;
    ideaReason: string;
    experience: string;
    team: string;
  };
  if (!body.founderName || !body.email || !body.registrationStatus ||
      !body.startupIdea || !body.readiness || !body.ideaReason ||
      !body.experience || !body.team) {
    res.status(400).json({ error: "All required fields must be provided" });
    return;
  }
  const [created] = await db
    .insert(startupApplicationsTable)
    .values({
      founderName: body.founderName,
      email: body.email,
      registrationStatus: body.registrationStatus,
      startupIdea: body.startupIdea,
      readiness: body.readiness,
      readinessDetail: body.readinessDetail ?? "",
      ideaReason: body.ideaReason,
      experience: body.experience,
      team: body.team,
    })
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
  const { result, resultReason } = req.body as { result: string; resultReason?: string };
  if (!result) { res.status(400).json({ error: "result required" }); return; }
  const [updated] = await db
    .update(startupApplicationsTable)
    .set({ result, resultReason: resultReason ?? null })
    .where(eq(startupApplicationsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Application not found" }); return; }
  res.json(updated);
});

export default router;
