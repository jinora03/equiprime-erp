import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Monitor, Moon, ShieldCheck, Sun } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { PageHeader } from "@/shared/components/page-header";
import { UserAvatar } from "@/shared/components/user-avatar";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";
import { useUpdateUser } from "@/features/users/hooks";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  job_title: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const updateUserMutation = useUpdateUser();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone: user?.phone ?? "",
      job_title: user?.job_title ?? "",
    },
  });

  if (!user) return null;

  const onSubmit = async (values: ProfileForm) => {
    try {
      await updateUserMutation.mutateAsync({ id: user.id, input: values });
      updateUser({
        ...values,
        full_name: `${values.first_name} ${values.last_name}`,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't update profile.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and preferences."
      />

      {/* Identity header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
          <UserAvatar
            name={user.full_name}
            src={user.avatar}
            className="h-20 w-20 text-xl"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-foreground">
              {user.full_name}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="outline">{user.role}</Badge>
              <Badge variant="secondary">{user.department}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                Update your name and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input value={user.department} disabled />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending
                        ? "Saving…"
                        : "Save changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Choose a strong password you don't use elsewhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div />
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm new password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    toast.info("Password changes are available in a later phase.")
                  }
                >
                  <KeyRound className="h-4 w-4" /> Update password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Authenticator app
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use a TOTP app to generate verification codes.
                    </p>
                  </div>
                </div>
                <Switch
                  onCheckedChange={() =>
                    toast.info("2FA setup is available in a later phase.")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Equiprime looks for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                        theme === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <option.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Compact density
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing to fit more on screen.
                  </p>
                </div>
                <Switch
                  onCheckedChange={() =>
                    toast.info("Density options arrive in a later phase.")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
