type StartupPostStatus = {
  isActive: boolean;
  endDate?: string | null;
};

export function isStartupPostRecruiting(post: StartupPostStatus): boolean {
  const todayInKorea = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return post.isActive && (!post.endDate || post.endDate >= todayInKorea);
}