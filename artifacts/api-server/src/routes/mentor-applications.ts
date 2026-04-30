import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, mentorApplicationsTable } from "@workspace/db";
import {
  CreateMentorApplicationBody,
  UpdateMentorApplicationStatusBody,
  UpdateMentorApplicationStatusParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.post("/mentor-applications", async (req, res) => {
  const parsed = CreateMentorApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [created] = await db
    .insert(mentorApplicationsTable)
    .values(parsed.data)
    .returning();

  req.log.info({ applicationId: created.id }, "Mentor application created");
  res.status(201).json(created);
});

router.get("/mentor-applications", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(mentorApplicationsTable)
    .orderBy(desc(mentorApplicationsTable.createdAt));
  res.json(rows);
});

router.patch(
  "/mentor-applications/:id/status",
  requireAdmin,
  async (req, res) => {
    const parsedParams = UpdateMentorApplicationStatusParams.safeParse(
      req.params,
    );
    const parsedBody = UpdateMentorApplicationStatusBody.safeParse(req.body);
    if (!parsedParams.success || !parsedBody.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const { id } = parsedParams.data;
    const { status } = parsedBody.data;

    const [updated] = await db
      .update(mentorApplicationsTable)
      .set({
        status,
        readAt: status === "read" ? new Date() : null,
      })
      .where(eq(mentorApplicationsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json(updated);
  },
);

export default router;
