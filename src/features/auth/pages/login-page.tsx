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
import { Checkbox } from "@/components/ui/checkbox";
import { DEMO_CREDENTIALS } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import equiprimeLogo from "@/assets/equiprime-logo.jpg";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? ROUTES.DASHBOARD;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true);
    try {
      const user = await login({
        email: values.email,
        password: values.password,
      });
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      toast.error("Sign in failed", { description: message });
      form.setError("password", { message });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    form.setValue("email", DEMO_CREDENTIALS.email);
    form.setValue("password", DEMO_CREDENTIALS.password);
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

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer font-normal text-muted-foreground">
                  Keep me signed in
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Sign in
          </Button>
        </form>
      </Form>

      <div className="rounded-lg border border-dashed bg-muted/40 p-4">
        <p className="text-xs font-medium text-foreground">Demo account</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={fillDemo}
        >
          Use demo credentials
        </Button>
      </div>
    </div>
  );
}
