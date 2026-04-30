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
      className={cn("inline-block select-none", animClass, className)}
      draggable={false}
    />
  );
}

export function WemiWordmark({
  height = 56,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}wemi-ci.png`}
      alt="위미 We Me"
      style={{ height }}
      className={cn("inline-block select-none w-auto", className)}
      draggable={false}
    />
  );
}
