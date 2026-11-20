type StartupPostStatus = {
  isActive: boolean;
  endDate?: string | null;
};

export function getKoreanToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function millisecondsUntilNextKoreanDay(): number {
  // A Korean calendar day ends at 15:00 UTC, including across month/year boundaries.
  return Date.parse(`${getKoreanToday()}T15:00:00.000Z`) - Date.now();
}

export function watchKoreanToday(
  onDayChange: (today: string) => void,
  visibilityTarget: Pick<Document, "addEventListener" | "removeEventListener"> = document,
): () => void {
  let timer: ReturnType<typeof setTimeout>;

  function reschedule() {
    clearTimeout(timer);
    onDayChange(getKoreanToday());
    timer = setTimeout(reschedule, millisecondsUntilNextKoreanDay());
  }

  reschedule();
  // Background tabs may throttle timers; check the date as soon as they become visible.
  visibilityTarget.addEventListener("visibilitychange", reschedule);
  return () => {
    clearTimeout(timer);
    visibilityTarget.removeEventListener("visibilitychange", reschedule);
  };
}

export function isStartupPostRecruiting(post: StartupPostStatus, todayInKorea = getKoreanToday()): boolean {
  return post.isActive && (!post.endDate || post.endDate >= todayInKorea);
}