import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, UserPlus, User, ChevronDown, Menu, X, ChevronRight } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface WebShellProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  href?: string;
  items?: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "직무·멘토링",
    items: [
      { href: "/jobs", label: "직무 학습" },
      { href: "/mentors", label: "졸업생 멘토링" },
    ],
  },
  {
    label: "도전·성장",
    items: [
      { href: "/career-match", label: "창업 프로젝트" },
      { href: "/career-matching", label: "고민 맞춤 영상" },
    ],
  },
  {
    label: "인문·창작",
    items: [
      { href: "/humanities", label: "인문학 콘텐츠" },
      { href: "/creative-space", label: "창작 공간" },
    ],
  },
  {
    label: "커뮤니티",
    href: "/community",
  },
  {
    label: "문의하기",
    href: "/contact",
  },
];

function DropdownGroup({
  group,
  isAnyChildActive,
  isGroupActive,
}: {
  group: NavGroup;
  isAnyChildActive: boolean;
  isGroupActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (group.items && group.items.length > 0) setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  };

  if (!group.items || group.items.length === 0) {
    return (
      <Link href={group.href ?? "/"}>
        <button
          className={cn(
            "relative px-4 h-9 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
            isGroupActive
              ? "text-foreground bg-primary/15"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          )}
        >
          {group.label}
        </button>
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "flex items-center gap-1 px-4 h-9 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
          isAnyChildActive
            ? "text-foreground bg-primary/15"
            : open
            ? "text-foreground bg-muted/60"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
      >
        {group.label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="inline-flex"
        >
          <ChevronDown size={13} className="opacity-60" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/70 rounded-2xl shadow-xl shadow-black/8 p-1.5 min-w-[160px]">
              {group.items.map((item) => (
                <DropdownItem key={item.href} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ item }: { item: NavItem }) {
  const [location] = useLocation();
  const active = location === item.href || location.startsWith(item.href + "/");

  return (
    <Link href={item.href}>
      <button
        className={cn(
          "w-full text-left flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
          active
            ? "bg-primary/15 text-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <span>{item.label}</span>
        {item.badge && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/70 leading-none">
            {item.badge}
          </span>
        )}
      </button>
    </Link>
  );
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [location] = useLocation();
  const { user, nickname, signOut } = useAuth();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border/60 flex flex-col shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border/40 shrink-0">
              <Link href="/" onClick={onClose}>
                <span className="font-extrabold text-lg tracking-tight">위미</span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* nav items */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              {NAV_GROUPS.map((group) => {
                if (!group.items || group.items.length === 0) {
                  return (
                    <Link key={group.label} href={group.href ?? "/"} onClick={onClose}>
                      <button
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                          isActive(group.href ?? "")
                            ? "bg-primary/15 text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        {group.label}
                      </button>
                    </Link>
                  );
                }

                const expanded = expandedGroup === group.label;
                const anyChildActive = group.items.some((item) => isActive(item.href));

                return (
                  <div key={group.label}>
                    <button
                      onClick={() => setExpandedGroup(expanded ? null : group.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                        anyChildActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {group.label}
                      <motion.span
                        animate={{ rotate: expanded ? 90 : 0 }}
                        transition={{ duration: 0.18 }}
                        className="inline-flex"
                      >
                        <ChevronRight size={15} className="opacity-50" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-3 border-l border-border/50 mb-1">
                            {group.items.map((item) => (
                              <Link key={item.href} href={item.href} onClick={onClose}>
                                <button
                                  className={cn(
                                    "w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    isActive(item.href)
                                      ? "bg-primary/15 text-foreground"
                                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                  )}
                                >
                                  {item.label}
                                  {item.badge && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/70 leading-none">
                                      {item.badge}
                                    </span>
                                  )}
                                </button>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* user area */}
            <div className="border-t border-border/40 p-4 shrink-0 space-y-2">
              {user ? (
                <>
                  <Link href="/mypage" onClick={onClose}>
                    <button className="w-full flex items-center gap-2 text-sm font-semibold bg-primary/10 hover:bg-primary/20 px-4 py-3 rounded-xl transition-colors">
                      <User size={15} className="shrink-0" />
                      <span className="truncate">{nickname ?? user.email}</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => { signOut(); onClose(); }}
                    className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 px-4 py-3 rounded-xl transition-colors"
                  >
                    <LogOut size={15} />
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={onClose}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <LogIn size={14} />
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={onClose}>
                    <Button size="sm" className="w-full gap-1.5">
                      <UserPlus size={14} />
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function WebShell({ children }: WebShellProps) {
  const [location] = useLocation();
  const { user, loading, nickname, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isChildActive = (group: NavGroup) => {
    if (group.href) return location === group.href || location.startsWith(group.href + "/");
    return group.items?.some(
      (item) => location === item.href || location.startsWith(item.href + "/"),
    ) ?? false;
  };

  return (
    <div className="min-h-screen flex flex-col wemi-page-bg">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 로고 */}
          <Link href="/">
            <button className="flex items-center gap-2 -ml-2 px-2 py-1 rounded-xl hover-elevate shrink-0">
              <Mascot size={32} animate="bob" />
              <span className="font-extrabold text-lg tracking-tight">위미</span>
            </button>
          </Link>

          {/* 데스크톱 네비게이션 (md 이상) */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_GROUPS.map((group) => {
              const anyChildActive = isChildActive(group);
              return (
                <DropdownGroup
                  key={group.label}
                  group={group}
                  isAnyChildActive={anyChildActive}
                  isGroupActive={anyChildActive}
                />
              );
            })}
          </nav>

          {/* 데스크톱 유저 영역 */}
          <div className="flex items-center gap-2 shrink-0">
            {!loading && (
              <>
                {/* 데스크톱 전용 */}
                <div className="hidden md:flex items-center gap-2">
                  {user ? (
                    <>
                      <Link href="/mypage">
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors max-w-[140px]">
                          <User size={12} className="shrink-0" />
                          <span className="truncate">{nickname ?? user.email}</span>
                        </button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={signOut}
                      >
                        <LogOut size={15} />
                        <span>로그아웃</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                          <LogIn size={15} />
                          <span>로그인</span>
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button size="sm" className="gap-1.5">
                          <UserPlus size={15} />
                          <span>회원가입</span>
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}

            {/* 햄버거 버튼 (모바일 전용) */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      {/* 모바일 슬라이드 메뉴 */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 mt-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Mascot size={36} />
            <div>
              <p className="font-bold text-sm">위미</p>
              <p className="text-xs text-muted-foreground">인문계열을 위한 취업 플랫폼</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <Link href="/privacy" className="hover:text-foreground transition-colors">개인정보처리방침</Link>
              <span className="opacity-30">|</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">이용약관</Link>
              <span className="opacity-30">|</span>
              <Link href="/about" className="hover:text-foreground transition-colors">위미소개</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 We Me. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
