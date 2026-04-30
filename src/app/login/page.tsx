import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Authentication</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Supabase admin access</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Sign in with your admin account to access team management, daily update ingestion, project intelligence,
          and score controls. Supabase environment variables must be configured before login can work.
        </p>
        <div className="mt-10 flex justify-center">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
