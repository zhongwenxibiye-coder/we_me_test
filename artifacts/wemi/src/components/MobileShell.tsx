import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Briefcase, Users, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: ReactNode;
  showTabs?: boolean;
}

const TABS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/jobs", label: "직무", icon: Briefcase },
  { href: "/mentors", label: "멘토", icon: Users },
  { href: "/me", label: "마이", icon: UserIcon },
];

export function MobileShell({ children, showTabs = true }: MobileShellProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen w-full wemi-page-bg">
      <div className="mx-auto w-full max-w-[440px] min-h-screen bg-background relative shadow-xl border-x border-border/40 flex flex-col">
        <main className={cn("flex-1 flex flex-col", showTabs && "pb-24")}>{children}</main>

        {showTabs && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40">
            <div className="mx-3 mb-3 rounded-3xl bg-card/95 backdrop-blur-xl border border-border shadow-lg">
              <div className="grid grid-cols-4 px-2 py-2">
                {TABS.map((tab) => {
                  const active = isActive(tab.href);
                  const Icon = tab.icon;
                  return (
                    <Link key={tab.href} href={tab.href}>
                      <button
                        type="button"
                        className={cn(
                          "relative flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-colors",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="active-tab-bg"
                            className="absolute inset-0 bg-primary/15 rounded-2xl"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">
                          <Icon
                            size={22}
                            strokeWidth={active ? 2.4 : 2}
                            className={cn(active && "text-primary-foreground")}
                            style={active ? { color: "hsl(35 50% 25%)" } : undefined}
                          />
                        </span>
                        <span
                          className={cn(
                            "relative z-10 text-[11px] font-medium",
                            active && "font-semibold",
                          )}
                        >
                          {tab.label}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
