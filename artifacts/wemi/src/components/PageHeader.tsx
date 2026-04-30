import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, back, right, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60",
        className,
      )}
    >
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        {back && (
          <Link href={back}>
            <button
              type="button"
              aria-label="뒤로 가기"
              className="-ml-2 size-9 rounded-full flex items-center justify-center hover-elevate active-elevate-2"
            >
              <ChevronLeft size={22} />
            </button>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
