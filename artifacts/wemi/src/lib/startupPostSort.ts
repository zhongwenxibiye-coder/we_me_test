import { isStartupPostRecruiting } from "./startupPostStatus.ts";

type DeadlinePost = { isActive: boolean; endDate?: string | null };

export function compareStartupPostsByDeadline(a: DeadlinePost, b: DeadlinePost): number {
  const aRecruiting = isStartupPostRecruiting(a);
  const bRecruiting = isStartupPostRecruiting(b);
  if (aRecruiting !== bRecruiting) return aRecruiting ? -1 : 1;
  if (!a.endDate) return b.endDate ? 1 : 0;
  if (!b.endDate) return -1;
  return aRecruiting
    ? a.endDate.localeCompare(b.endDate)
    : b.endDate.localeCompare(a.endDate);
}
