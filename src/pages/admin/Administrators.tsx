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
          <CardContent className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label htmlFor="promote-email">Email</Label>
              <Input id="promote-email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
            </div>
            <Button onClick={promote} className="w-full sm:w-auto min-h-10">Promote</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Current administrators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {admins.map((a) => {
              const isPrimary = a.email.toLowerCase() === SEED_ADMIN;
              const isSelf = a.id === user?.id;
              const displayName = a.full_name || a.email.split("@")[0];
              const initials = displayName.slice(0, 2).toUpperCase();
              return (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-border/60 hover:border-border transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary shrink-0" aria-hidden="true">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{displayName}</span>
                        {isPrimary && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-4">Primary</Badge>
                        )}
                        {isSelf && (
                          <Badge variant="outline" className="bg-secondary text-[10px] px-1.5 py-0 h-4">You</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{a.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Revoke admin for ${a.email}`}
                    className="w-full sm:w-auto min-h-10 sm:min-h-9 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 disabled:opacity-40"
                    disabled={isPrimary || isSelf}
                    onClick={() => revoke(a)}
                  >
                    <ShieldOff className="h-4 w-4" />Revoke
                  </Button>
                </div>
              );
            })}
            {admins.length === 0 && (
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <Shield className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No administrators yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Administrators;
