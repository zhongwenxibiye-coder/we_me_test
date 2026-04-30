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
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const currentYear = new Date().getFullYear();

const schema = z.object({
  name: z.string().min(2, "이름을 두 글자 이상 입력해주세요."),
  email: z.string().email("올바른 이메일을 입력해주세요."),
  password: z.string().min(4, "비밀번호는 4자 이상이에요."),
  university: z.string().min(2, "학교명을 입력해주세요."),
  major: z.string().min(2, "전공을 입력해주세요."),
  graduationYear: z
    .number({ invalid_type_error: "졸업(예정) 연도를 입력해주세요." })
    .int()
    .min(1970)
    .max(currentYear + 10),
});

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      graduationYear: currentYear + 1,
    },
  });

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    const result = signUp(values);
    setSubmitting(false);
    if (!result.ok) {
      toast({ title: "회원가입에 실패했어요", description: result.error });
      return;
    }
    toast({ title: `환영해요, ${result.user.name}님`, description: "위미와 함께 시작해볼까요?" });
    setLocation("/");
  };

  return (
    <div>
      <PageHeader title="회원가입" back="/" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-5 pb-10"
      >
        <div className="text-center">
          <Mascot size={72} animate="bob" />
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">반가워요!</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            몇 가지만 알려주시면 진로 추천이 더 정확해져요.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-3.5">
          <Field label="이름" error={errors.name?.message}>
            <Input
              placeholder="홍길동"
              autoComplete="name"
              className="h-12 rounded-2xl"
              {...register("name")}
            />
          </Field>
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
              placeholder="4자 이상"
              autoComplete="new-password"
              className="h-12 rounded-2xl"
              {...register("password")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="학교" error={errors.university?.message}>
              <Input
                placeholder="예) 서울대"
                className="h-12 rounded-2xl"
                {...register("university")}
              />
            </Field>
            <Field label="전공" error={errors.major?.message}>
              <Input
                placeholder="예) 국어국문학"
                className="h-12 rounded-2xl"
                {...register("major")}
              />
            </Field>
          </div>
          <Field label="졸업(예정) 연도" error={errors.graduationYear?.message}>
            <Input
              type="number"
              inputMode="numeric"
              className="h-12 rounded-2xl"
              {...register("graduationYear", { valueAsNumber: true })}
            />
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-13 rounded-2xl text-base font-semibold mt-3"
            size="lg"
          >
            가입하고 시작하기
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          이미 위미를 쓰고 있어요?{" "}
          <Link href="/login">
            <span className="font-semibold text-foreground underline-offset-4 hover:underline cursor-pointer">
              로그인
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
