// 저장된 콘텐츠(HTML 또는 마크다운)를 올바르게 렌더링하는 공용 컴포넌트

import { cn } from "@/lib/utils";

// HTML 인지 판단 (TipTap 출력은 항상 <p>로 시작)
function isHTML(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("<");
}

// ── 마크다운 렌더러 (기존 콘텐츠 호환) ───────────────────────
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono text-foreground/80">
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

function renderBlock(text: string, idx: number): React.ReactNode {
  if (text.startsWith("## "))
    return <h3 key={idx} className="text-base font-extrabold text-foreground mt-5 mb-1.5 first:mt-0">{text.slice(3)}</h3>;
  if (text.startsWith("### "))
    return <h4 key={idx} className="text-sm font-bold text-foreground mt-4 mb-1 first:mt-0">{text.slice(4)}</h4>;

  const lines = text.split("\n").filter(Boolean);
  const isList = lines.length > 1 && lines.every((l) => /^[\-•·]\s/.test(l.trim()) || l.trim() === "");
  if (isList) {
    return (
      <ul key={idx} className="space-y-1.5 list-none pl-0">
        {lines.filter(Boolean).map((l, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-[1.8] text-foreground/75">
            <span className="mt-[5px] size-1.5 rounded-full bg-primary/70 shrink-0" />
            <span>{renderInline(l.replace(/^[\-•·]\s*/, ""))}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p key={idx} className="text-sm leading-[1.85] text-foreground/75 whitespace-pre-line">
      {renderInline(text)}
    </p>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return <div className="space-y-3">{blocks.map((block, idx) => renderBlock(block, idx))}</div>;
}

// ── 공용 RichContent 컴포넌트 ────────────────────────────────
interface RichContentProps {
  content: string;
  className?: string;
  prose?: boolean; // HTML 렌더 시 prose 클래스 사용 여부 (기본 true)
}

export function RichContent({ content, className, prose = true }: RichContentProps) {
  if (!content) return null;

  if (isHTML(content)) {
    return (
      <div
        className={cn(
          prose && "prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground/80 prose-ul:my-2",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={cn("max-w-2xl", className)}>
      <MarkdownContent content={content} />
    </div>
  );
}
