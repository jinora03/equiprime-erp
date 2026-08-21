import { Bell, Building2, Palette, Plug, ShieldCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import { COMPANY_NAME } from "@/constants/app";
import { useTheme } from "@/contexts/theme-context";
import { PageHeader } from "@/shared/components/page-header";
import type { Theme } from "@/types";

const demoOnlyToast = () =>
  toast.info("Demo-only setting", {
    description: "This control is not persisted in the browser-only demo.",
  });

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your workspace, appearance, and integrations."
      />

      <Tabs defaultValue="general">
        <ScrollableTabsList>
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-4 w-4" /> Integrations
          </TabsTrigger>
        </ScrollableTabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company profile</CardTitle>
              <CardDescription>
                Details used across documents and the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company name</Label>
                  <Input defaultValue="Equiprime" />
                </div>
                <div className="space-y-2">
                  <Label>Legal name</Label>
                  <Input defaultValue={COMPANY_NAME} />
                </div>
                <div className="space-y-2">
                  <Label>Contact email</Label>
                  <Input type="email" defaultValue="support@equiprime.ph" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+63 2 8000 0000" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="manila">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manila">
                        (GMT+8) Asia/Manila
                      </SelectItem>
                      <SelectItem value="singapore">
                        (GMT+8) Asia/Singapore
                      </SelectItem>
                      <SelectItem value="tokyo">(GMT+9) Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="php">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="php">PHP — Philippine Peso</SelectItem>
                      <SelectItem value="usd">USD — US Dollar</SelectItem>
                      <SelectItem value="sgd">SGD — Singapore Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={demoOnlyToast}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Control the look and feel of the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 sm:max-w-xs">
                <Label>Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(v) => setTheme(v as Theme)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <SettingToggle
                title="Sidebar auto-collapse"
                description="Collapse the sidebar automatically on smaller screens."
                onToggle={demoOnlyToast}
                defaultChecked
              />
              <SettingToggle
                title="Reduced motion"
                description="Minimize animations across the interface."
                onToggle={demoOnlyToast}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Choose what you're notified about and how.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingToggle
                title="Job order updates"
                description="Assignments, status changes, and completions."
                onToggle={demoOnlyToast}
                defaultChecked
              />
              <Separator />
              <SettingToggle
                title="Inventory alerts"
                description="Low stock and reorder notifications."
                onToggle={demoOnlyToast}
                defaultChecked
              />
              <Separator />
              <SettingToggle
                title="Approvals"
                description="Requests waiting on your review."
                onToggle={demoOnlyToast}
                defaultChecked
              />
              <Separator />
              <SettingToggle
                title="Email digest"
                description="A daily summary delivered to your inbox."
                onToggle={demoOnlyToast}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Protect your workspace and manage sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingToggle
                title="Require 2FA for all users"
                description="Enforce two-factor authentication org-wide."
                onToggle={demoOnlyToast}
              />
              <Separator />
              <SettingToggle
                title="Login alerts"
                description="Notify admins of sign-ins from new devices."
                onToggle={demoOnlyToast}
                defaultChecked
              />
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Session timeout
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically sign out inactive users.
                  </p>
                </div>
                <Select defaultValue="8h">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect Equiprime with the tools your team already uses.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "Email & SMTP", desc: "Transactional email delivery" },
                { name: "Accounting Sync", desc: "QuickBooks / Xero export" },
                { name: "SMS Gateway", desc: "Field mechanic alerts" },
                { name: "Webhooks", desc: "Push events to your systems" },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {integration.name}
                      </p>
                      <Badge variant="secondary">Soon</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integration.desc}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={demoOnlyToast}>
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  onToggle,
  defaultChecked,
}: {
  title: string;
  description: string;
  onToggle: () => void;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} onCheckedChange={onToggle} />
    </div>
  );
}
