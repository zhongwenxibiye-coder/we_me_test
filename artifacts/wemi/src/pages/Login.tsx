import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mascot } from "@/components/Mascot";
import { PageHeader } from "@/components/PageHeader";
import { signIn } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요."),
  password: z.string().min(4, "비밀번호는 4자 이상이에요."),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    const result = signIn(values.email, values.password);
    setSubmitting(false);
    if (!result.ok) {
      toast({ title: "로그인할 수 없어요", description: result.error });
      return;
    }
    toast({ title: `다시 만나서 반가워요, ${result.user.name}님` });
    setLocation("/");
  };

  return (
    <div>
      <PageHeader title="로그인" back="/" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-6 pb-10 flex flex-col"
      >
        <div className="text-center">
          <Mascot size={88} animate="bob" />
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">다시 와줘서 고마워요</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            오늘도 한 걸음 함께 가볼까요?
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Field label="이메일" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 rounded-2xl"
              {...register("email")}
            />
          </Field>
          <Field label="비밀번호" error={errors.password?.message}>
            <Input
              type="password"
              placeholder="비밀번호"
              autoComplete="current-password"
              className="h-12 rounded-2xl"
              {...register("password")}
            />
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-13 rounded-2xl text-base font-semibold mt-2"
            size="lg"
          >
            로그인
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          아직 위미가 처음이에요?{" "}
          <Link href="/signup">
            <span className="font-semibold text-foreground underline-offset-4 hover:underline cursor-pointer">
              회원가입
            </span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
