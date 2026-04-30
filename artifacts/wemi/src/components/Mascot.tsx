import { cn } from "@/lib/utils";

interface MascotProps {
  size?: number;
  className?: string;
  animate?: "float" | "bob" | "none";
}

export function Mascot({ size = 80, className, animate = "none" }: MascotProps) {
  const animClass =
    animate === "float" ? "wemi-float" : animate === "bob" ? "wemi-bob" : "";
  return (
    <img
      src={`${import.meta.env.BASE_URL}wemi-character.png`}
      alt="위미 캐릭터"
      width={size}
      height={size}
      className={cn("inline-block select-none drop-shadow-md", animClass, className)}
      draggable={false}
    />
  );
}
