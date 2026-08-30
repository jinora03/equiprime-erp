import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  USE_MOCK,
} from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/services/api/errors";
import equiprimeLogo from "@/assets/equiprime-logo.jpg";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submittingSource, setSubmittingSource] = useState<string | null>(null);
  const submitting = submittingSource !== null;

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? ROUTES.DASHBOARD;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signIn = async (values: LoginForm, source: string) => {
    setSubmittingSource(source);
    try {
      const user = await login({
        email: values.email,
        password: values.password,
      });
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to sign in.");
      toast.error("Sign in failed", { description: message });
      if (source === "form") form.setError("password", { message });
    } finally {
      setSubmittingSource(null);
    }
  };

  const onSubmit = (values: LoginForm) => signIn(values, "form");

  const handleDemoAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    form.clearErrors();
    form.reset({ email: account.email, password: DEMO_PASSWORD });
  };

  return (
    <div className="space-y-8">
      {/* Brand logo — also the only branding on mobile where the side panel is hidden */}
      <img
        src={equiprimeLogo}
        alt="Equiprime"
        className="h-11 w-auto lg:hidden"
      />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the Equiprime ERP workspace.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@equiprime.ph"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      toast.info("Password reset is available in a later phase.")
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submittingSource === "form" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Sign in
          </Button>
        </form>
      </Form>

      {USE_MOCK ? (
        <div className="rounded-lg border border-dashed bg-muted/40 p-4">
          <p className="text-xs font-medium text-foreground">Demo accounts</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Choose a role-specific account to fill the credentials, then click
            Sign in to test permissions and workflow behavior.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.key}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal px-3 py-3 text-left"
                disabled={submitting}
                onClick={() => handleDemoAccount(account)}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{account.label}</span>
                  <span className="mt-0.5 block break-all text-xs font-normal text-muted-foreground">
                    {account.email}
                  </span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {account.description}
                  </span>
                </span>
              </Button>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Shared password: <span className="font-mono">{DEMO_PASSWORD}</span>.
            Mock changes stay in memory while switching accounts and reset when
            the page is reloaded.
          </p>
        </div>
      ) : null}
    </div>
  );
}
