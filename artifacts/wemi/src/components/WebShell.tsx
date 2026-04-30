import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

interface WebShellProps {
  children: ReactNode;
}

const NAV = [
  { href: "/", label: "홈" },
  { href: "/jobs", label: "직무 학습" },
  { href: "/mentors", label: "졸업생 멘토링" },
];

export function WebShell({ children }: WebShellProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen flex flex-col wemi-page-bg">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 -ml-2 px-2 py-1 rounded-xl hover-elevate">
              <Mascot size={32} animate="bob" />
              <span className="font-extrabold text-lg tracking-tight">위미</span>
            </button>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "relative px-4 h-10 rounded-full text-sm font-medium transition-colors hover-elevate",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-primary/20 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
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
