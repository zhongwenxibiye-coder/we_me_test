---
name: Quiz streak architecture
description: How the quiz streak system works for guests vs members, merge logic, and abuse prevention
---

**Guest streak:** localStorage key `wemi-quiz-streak` = `{ count: number, lastDate: "YYYY-MM-DD" }`.
**Member streak:** Same localStorage + synced to `supabase.auth.updateUser({ data: { quiz_streak: ... } })` (user_metadata).

**Gap tolerance:** 4 days max gap allowed (skipping 3 days still keeps streak). See `daysDiff` + `GAP_TOLERANCE_DAYS = 4` in QuizSection.tsx.

**Merge on login (abuse prevention):**
- localStorage key `wemi-streak-merged-{userId}` stores the lastDate of the last merged local streak
- On login, if local streak's lastDate ≠ stored merged date → eligible for merge
- Merge = `Math.max(local.count, server.count)` (take the higher count)
- After merge, update the stored merged date to prevent re-merging same streak data

**Why:** Prevents logout→quiz→login cycle that would inflate streak counts. The mergedDate approach allows legitimate new guest days after logout to be merged later.

**Server save:** After quiz answer, if user is logged in, call `supabase.auth.updateUser({ data: { quiz_streak: newStreak } })`.
