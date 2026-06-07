import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, ShieldOff } from "lucide-react";
import { toast } from "sonner";

const SEED_ADMIN = "sandeshsanjaykamble52@gmail.com";

const Administrators = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState("");

  const load = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) return setAdmins([]);
    const { data: profiles } = await supabase.from("profiles").select("id,email,full_name,created_at").in("id", ids);
    setAdmins(profiles ?? []);
  };

  useEffect(() => { load(); }, []);

  const promote = async () => {
    const target = email.trim().toLowerCase();
    if (!target) return;
    const { data: prof } = await supabase.from("profiles").select("id").ilike("email", target).maybeSingle();
    if (!prof) return toast.error("No user with that email has signed up yet");
    const { error } = await supabase.from("user_roles").insert({ user_id: prof.id, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("Admin promoted");
    setEmail("");
    load();
  };

  const revoke = async (a: any) => {
    if (a.email.toLowerCase() === SEED_ADMIN) return toast.error("Cannot revoke the primary admin");
    if (a.id === user?.id) return toast.error("You can't revoke your own admin");
    const { error } = await supabase.from("user_roles").delete().eq("user_id", a.id).eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success("Admin revoked");
    load();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Administrators">
        <Card className="border-border/60 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Promote user to admin</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[220px] space-y-1.5">
              <Label htmlFor="promote-email">Email</Label>
              <Input id="promote-email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={promote}>Promote</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Current administrators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.email}</div>
                  {a.full_name && <div className="text-xs text-muted-foreground truncate">{a.full_name}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.email.toLowerCase() === SEED_ADMIN && <Badge variant="outline">Primary</Badge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={a.email.toLowerCase() === SEED_ADMIN || a.id === user?.id}
                    onClick={() => revoke(a)}
                  >
                    <ShieldOff className="h-4 w-4" />Revoke
                  </Button>
                </div>
              </div>
            ))}
            {admins.length === 0 && <p className="text-sm text-muted-foreground">No administrators yet.</p>}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Administrators;
