import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, creativeWorkSubmissionsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.post("/creative-work-submissions", async (req, res) => {
  const body = req.body as {
    authorName: string;
    email: string;
    description: string;
  };
  if (!body.authorName || !body.email || !body.description) {
    res.status(400).json({ error: "authorName, email, description required" });
    return;
  }
  if (body.description.length < 200) {
    res.status(400).json({ error: "description must be at least 200 characters" });
    return;
  }
  const [created] = await db
    .insert(creativeWorkSubmissionsTable)
    .values({
      authorName: body.authorName,
      email: body.email,
      description: body.description,
    })
    .returning();
  res.status(201).json(created);
});

router.get("/creative-work-submissions", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(creativeWorkSubmissionsTable)
    .orderBy(desc(creativeWorkSubmissionsTable.createdAt));
  res.json(rows);
});

router.patch("/creative-work-submissions/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const { status } = req.body as { status: string };
  const [updated] = await db
    .update(creativeWorkSubmissionsTable)
    .set({ status })
    .where(eq(creativeWorkSubmissionsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

export default router;
