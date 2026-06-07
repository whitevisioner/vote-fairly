import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { Palette, Globe, Shield, User } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [platformName, setPlatformName] = useState("CastVote");
  const [requireEmailConfirm, setRequireEmailConfirm] = useState(true);
  const [liveResults, setLiveResults] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setFullName(data?.full_name ?? ""));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <AdminGuard>
      <AdminLayout title="Settings">
        <div className="grid lg:grid-cols-2 gap-4">
          <Section icon={Palette} title="Theme" description="Light, dark, or follow system.">
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <Button key={t} variant={theme === t ? "default" : "outline"} size="sm" onClick={() => setTheme(t)} className="capitalize">
                  {t}
                </Button>
              ))}
            </div>
          </Section>

          <Section icon={Globe} title="Platform" description="General platform configuration.">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Platform name</Label>
              <Input id="pname" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label className="text-sm">Show live results by default</Label>
                <p className="text-xs text-muted-foreground">New elections start with live results visible.</p>
              </div>
              <Switch checked={liveResults} onCheckedChange={setLiveResults} />
            </div>
          </Section>

          <Section icon={Shield} title="Security" description="Authentication and access policies.">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Require email confirmation</Label>
                <p className="text-xs text-muted-foreground">Users must verify their email before signing in.</p>
              </div>
              <Switch checked={requireEmailConfirm} onCheckedChange={setRequireEmailConfirm} />
            </div>
          </Section>

          <Section icon={User} title="Profile" description="Your personal information.">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fname">Full name</Label>
              <Input id="fname" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <Button onClick={saveProfile} size="sm">Save profile</Button>
          </Section>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

const Section = ({ icon: Icon, title, description, children }: any) => (
  <Card className="border-border/60">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4" />{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

export default Settings;
