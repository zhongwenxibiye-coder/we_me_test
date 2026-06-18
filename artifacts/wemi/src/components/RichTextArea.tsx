import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading2, Heading3, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
  rows?: number;
  className?: string;
}

export function RichTextArea({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  minHeight,
  rows,
  className = "",
}: RichTextAreaProps) {
  const computedMinHeight = minHeight ?? (rows ? rows * 24 : 120);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const empty = editor.isEmpty;
      onChange(empty ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content focus:outline-none",
        style: `min-height:${computedMinHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (current === value) return;
    editor.commands.setContent(value || "");
  }, [value, editor]);

  if (!editor) return null;

  const toolbarItems = [
    {
      label: <Bold size={13} />,
      title: "볼드 (B)",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: <Italic size={13} />,
      title: "기울임 (I)",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    { sep: true },
    {
      label: <Heading2 size={13} />,
      title: "큰 소제목",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: <Heading3 size={13} />,
      title: "작은 소제목",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    { sep: true },
    {
      label: <List size={13} />,
      title: "글머리 목록",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
  ] as const;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40",
        className,
      )}
    >
      {/* 툴바 */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-muted/40 flex-wrap">
        {toolbarItems.map((item, i) => {
          if ("sep" in item) {
            return <div key={`sep-${i}`} className="w-px h-4 bg-border/60 mx-0.5" />;
          }
          return (
            <button
              key={i}
              type="button"
              title={item.title}
              onClick={item.action}
              className={cn(
                "p-1.5 rounded text-xs transition-colors",
                item.active
                  ? "bg-primary/25 text-foreground"
                  : "hover:bg-primary/15 text-foreground/70",
              )}
            >
              {item.label}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-muted-foreground/40 hidden sm:inline">
          선택 후 버튼 클릭 · 다시 클릭하면 해제
        </span>
      </div>

      {/* 에디터 */}
      <EditorContent editor={editor} className="rich-editor-wrap" />
    </div>
  );
}
