import { useRef } from "react";

type FormatType = "bold" | "italic" | "h2" | "h3" | "bullet";

interface RichTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextArea({ value, onChange, placeholder, rows = 5, className = "" }: RichTextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyFormat(type: FormatType) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    let newVal = value;
    let newStart = start;
    let newEnd = end;

    if (type === "bold") {
      newVal = value.slice(0, start) + `**${selected}**` + value.slice(end);
      newStart = start + 2; newEnd = end + 2;
    } else if (type === "italic") {
      newVal = value.slice(0, start) + `*${selected}*` + value.slice(end);
      newStart = start + 1; newEnd = end + 1;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const prefix = type === "h2" ? "## " : type === "h3" ? "### " : "- ";
      newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      newStart = start + prefix.length; newEnd = end + prefix.length;
    }

    onChange(newVal);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(newStart, newEnd); });
  }

  const toolbarBtns: { label: string; type: FormatType; title: string; className?: string }[] = [
    { label: "B", type: "bold", title: "볼드 — 텍스트 선택 후 클릭", className: "font-extrabold" },
    { label: "I", type: "italic", title: "기울임 — 텍스트 선택 후 클릭", className: "italic" },
    { label: "H2", type: "h2", title: "큰 소제목 (## )" },
    { label: "H3", type: "h3", title: "작은 소제목 (### )" },
    { label: "• 목록", type: "bullet", title: "글머리 기호 (- )" },
  ];

  return (
    <div className={`rounded-lg border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 ${className}`}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-muted/40 flex-wrap">
        {toolbarBtns.map((btn, i) => (
          <>
            {(i === 2 || i === 4) && <div key={`sep-${i}`} className="w-px h-4 bg-border/60 mx-0.5" />}
            <button
              key={btn.type}
              type="button"
              title={btn.title}
              onClick={() => applyFormat(btn.type)}
              className={`px-2 py-0.5 rounded text-xs hover:bg-primary/20 transition-colors text-foreground/80 ${btn.className ?? ""}`}
            >
              {btn.label}
            </button>
          </>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground/40 hidden sm:inline">텍스트 선택 → 버튼 클릭</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y px-3 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed"
      />
    </div>
  );
}
