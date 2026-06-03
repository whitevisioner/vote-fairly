import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings, Users } from "lucide-react";
import { toast } from "sonner";

const AdminElections = () => {
  const { user, loading, isAdmin } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("elections")
      .select("*")
      .neq("created_by", "7ebcdf88-10aa-4929-9fa6-00cc95c9213d")
      .order("created_at", { ascending: false });
    setElections(data ?? []);
    const { data: r } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (r) {
      const ids = r.map((x) => x.user_id);
      const { data: p } = await supabase.from("profiles").select("id,email,full_name").in("id", ids);
      setAdmins(p ?? []);
    }
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Layout><div className="container py-16 text-center">Admins only.</div></Layout>;

  const create = async () => {
    if (!title.trim()) return;
    const { data, error } = await supabase.from("elections")
      .insert({ title: title.trim(), description: description.trim() || null, created_by: user.id })
      .select().maybeSingle();
    if (error) { toast.error(error.message); return; }
    toast.success("Election created");
    setOpen(false); setTitle(""); setDescription("");
    load();
  };

  const promoteAdmin = async () => {
    if (!adminEmail.trim()) return;
    const { data: p } = await supabase.from("profiles").select("id").eq("email", adminEmail.trim().toLowerCase()).maybeSingle();
    if (!p) { toast.error("User not found. They must sign up first."); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: p.id, role: "admin" });
    if (error) { toast.error(error.message); return; }
    toast.success("Admin added");
    setAdminEmail(""); load();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Console</h1>
            <p className="text-muted-foreground">Manage elections, candidates, and voters.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />New election</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create election</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <Button onClick={create} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 mb-10">
          {elections.map((e) => (
            <Card key={e.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{e.title}</h3>
                  <Badge variant="outline">{e.status}</Badge>
                </div>
                {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/election/${e.id}`}><Settings className="h-4 w-4 mr-1.5" />Manage</Link>
              </Button>
            </Card>
          ))}
          {elections.length === 0 && <Card className="p-8 text-center text-muted-foreground">No elections yet.</Card>}
        </div>

        <Card className="p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><Users className="h-4 w-4" />Administrators</h2>
          <div className="space-y-2 mb-4">
            {admins.map((a) => (
              <div key={a.id} className="flex justify-between text-sm border-b py-2">
                <span>{a.full_name || a.email}</span>
                <span className="text-muted-foreground">{a.email}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="user@example.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            <Button onClick={promoteAdmin}>Promote</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">User must have signed up first.</p>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminElections;
