import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoMark } from "@/components/site/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-lift">
        <LogoMark className="size-12" />
        <h1 className="mt-6 text-2xl font-bold">Вход в админку</h1>
        <p className="mt-2 text-sm text-muted-foreground">Записи, врачи, услуги и настройки клиники.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
