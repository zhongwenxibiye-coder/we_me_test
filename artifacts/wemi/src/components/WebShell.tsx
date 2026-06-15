import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, UserPlus, User, ChevronDown } from "lucide-react";
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
    label: "실전·매칭",
    items: [
      { href: "/career-match", label: "프로젝트 참여" },
      { href: "/career-matching", label: "커리어 매칭", badge: "준비중" },
    ],
  },
  {
    label: "인문·창작",
    items: [
      { href: "/humanities", label: "인문학 콘텐츠", badge: "준비중" },
      { href: "/creative-space", label: "창작 공간" },
    ],
  },
  {
    label: "커뮤니티",
    href: "/community",
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

  // Direct link (no dropdown)
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
      {/* Trigger */}
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

      {/* Dropdown panel */}
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

export function WebShell({ children }: WebShellProps) {
  const [location] = useLocation();
  const { user, loading, nickname, signOut } = useAuth();

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

          {/* 메인 네비게이션 */}
          <nav className="flex items-center gap-0.5">
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

          {/* 유저 영역 */}
          {!loading && (
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <Link href="/mypage">
                    <button className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-foreground bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors max-w-[140px]">
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
                    <span className="hidden sm:inline">로그아웃</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                      <LogIn size={15} />
                      <span className="hidden sm:inline">로그인</span>
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="gap-1.5">
                      <UserPlus size={15} />
                      <span className="hidden sm:inline">회원가입</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

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
          <p className="text-xs text-muted-foreground">© 2026 We me. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
