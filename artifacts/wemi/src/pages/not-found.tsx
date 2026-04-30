import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12">
      <Mascot size={120} animate="float" />
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">길을 잃었어요</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        찾으시는 페이지가 없어요. 위미가 안내해드릴게요.
      </p>
      <Link href="/">
        <Button className="mt-6 rounded-full" size="lg">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
