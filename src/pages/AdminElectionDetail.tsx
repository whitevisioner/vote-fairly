import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Upload, Download, Calendar } from "lucide-react";
import { toast } from "sonner";

const randomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()
    .replace(/(.{4})/, "$1-");

const AdminElectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading, isAdmin } = useAuth();
  const [election, setElection] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);

  // forms
  const [posTitle, setPosTitle] = useState("");
  const [posDesc, setPosDesc] = useState("");
  const [candForms, setCandForms] = useState<Record<string, { name: string; bio: string; manifesto: string; file?: File }>>({});
  const [voterEmails, setVoterEmails] = useState("");

  const load = async () => {
    const { data: e } = await supabase.from("elections").select("*").eq("id", id).maybeSingle();
    setElection(e);
    const { data: pos } = await supabase.from("positions").select("*").eq("election_id", id).order("display_order");
    setPositions(pos ?? []);
    const ids = (pos ?? []).map((p) => p.id);
    if (ids.length) {
      const { data: c } = await supabase.from("candidates").select("*").in("position_id", ids);
      setCandidates(c ?? []);
    } else setCandidates([]);
    const { data: vl } = await supabase.from("voter_list").select("*").eq("election_id", id).order("created_at");
    setVoters(vl ?? []);
  };

  useEffect(() => { if (isAdmin && id) load(); }, [isAdmin, id]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const updateSchedule = async (start_at: string | null, end_at: string | null) => {
    const { error } = await supabase.from("elections").update({ start_at, end_at }).eq("id", id!);
    if (error) toast.error(error.message); else { toast.success("Schedule saved"); load(); }
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const emails = text.split(/[\s,;\n]+/).map((s) => s.trim().toLowerCase()).filter((s) => s.includes("@"));
    if (!emails.length) { toast.error("No valid emails found"); return; }
    const rows = emails.map((email) => ({ election_id: id!, email, voting_code: randomCode() }));
    const { error } = await supabase.from("voter_list").insert(rows);
    if (error) toast.error(error.message); else { toast.success(`${emails.length} voters imported`); load(); }
  };

  const addPosition = async () => {
    if (!posTitle.trim()) return;
    const { error } = await supabase.from("positions").insert({
      election_id: id!, title: posTitle.trim(), description: posDesc.trim() || null, display_order: positions.length,
    });
    if (error) toast.error(error.message); else { setPosTitle(""); setPosDesc(""); load(); }
  };

  const deletePosition = async (pid: string) => {
    if (!confirm("Delete this position and its candidates?")) return;
    await supabase.from("positions").delete().eq("id", pid);
    load();
  };

  const addCandidate = async (positionId: string) => {
    const f = candForms[positionId];
    if (!f?.name?.trim()) return;
    let photo_url: string | null = null;
    if (f.file) {
      const path = `${id}/${positionId}/${Date.now()}-${f.file.name}`;
      const { error: ue } = await supabase.storage.from("candidate-photos").upload(path, f.file);
      if (ue) { toast.error(ue.message); return; }
      photo_url = supabase.storage.from("candidate-photos").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("candidates").insert({
      position_id: positionId, name: f.name.trim(), bio: f.bio?.trim() || null, manifesto: f.manifesto?.trim() || null, photo_url,
    });
    if (error) toast.error(error.message);
    else { setCandForms({ ...candForms, [positionId]: { name: "", bio: "", manifesto: "" } }); load(); }
  };

  const deleteCandidate = async (cid: string) => {
    await supabase.from("candidates").delete().eq("id", cid);
    load();
  };

  const addVoters = async () => {
    const emails = voterEmails.split(/[\s,;\n]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!emails.length) return;
    const rows = emails.map((email) => ({ election_id: id!, email, voting_code: randomCode() }));
    const { error } = await supabase.from("voter_list").insert(rows);
    if (error) toast.error(error.message); else { toast.success(`${emails.length} voters added`); setVoterEmails(""); load(); }
  };

  const exportCodes = () => {
    const csv = "email,voting_code,used\n" + voters.map((v) => `${v.email},${v.voting_code},${v.code_used}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${election?.title}-voters.csv`; a.click();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">{election?.title}</h1>
            <Badge variant="outline" className="mt-1">{election?.status}</Badge>
          </div>
          <Select value={election?.status || ""} onValueChange={updateStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="positions">
          <TabsList>
            <TabsTrigger value="positions">Positions & Candidates</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Add position</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Title (e.g. President)" value={posTitle} onChange={(e) => setPosTitle(e.target.value)} />
                <Input placeholder="Description (optional)" value={posDesc} onChange={(e) => setPosDesc(e.target.value)} />
              </div>
              <Button className="mt-3" onClick={addPosition}>Add position</Button>
            </Card>

            {positions.map((pos) => (
              <Card key={pos.id} className="p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{pos.title}</h3>
                    {pos.description && <p className="text-sm text-muted-foreground">{pos.description}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deletePosition(pos.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>

                <div className="space-y-2 mb-4">
                  {candidates.filter((c) => c.position_id === pos.id).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-3">
                        {c.photo_url && <img src={c.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />}
                        <div>
                          <div className="font-medium">{c.name}</div>
                          {c.bio && <div className="text-xs text-muted-foreground">{c.bio}</div>}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteCandidate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Add candidate</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    <Input placeholder="Name" value={candForms[pos.id]?.name || ""}
                      onChange={(e) => setCandForms({ ...candForms, [pos.id]: { ...candForms[pos.id], name: e.target.value } })} />
                    <Input type="file" accept="image/*"
                      onChange={(e) => setCandForms({ ...candForms, [pos.id]: { ...candForms[pos.id], file: e.target.files?.[0] } })} />
                    <Input placeholder="Short bio" value={candForms[pos.id]?.bio || ""}
                      onChange={(e) => setCandForms({ ...candForms, [pos.id]: { ...candForms[pos.id], bio: e.target.value } })} />
                    <Textarea placeholder="Manifesto" value={candForms[pos.id]?.manifesto || ""}
                      onChange={(e) => setCandForms({ ...candForms, [pos.id]: { ...candForms[pos.id], manifesto: e.target.value } })} />
                  </div>
                  <Button className="mt-2" size="sm" onClick={() => addCandidate(pos.id)}>Add candidate</Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="voters" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Add approved voters</h3>
              <p className="text-sm text-muted-foreground mb-2">Paste emails (comma, space, or newline separated). A unique voting code is generated for each.</p>
              <Textarea rows={4} value={voterEmails} onChange={(e) => setVoterEmails(e.target.value)} placeholder="alice@example.com, bob@example.com" />
              <div className="flex gap-2 mt-3">
                <Button onClick={addVoters}><Upload className="h-4 w-4 mr-1.5" />Add voters</Button>
                <Button variant="outline" onClick={exportCodes} disabled={voters.length === 0}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Voter list ({voters.length})</h3>
              <div className="space-y-1 max-h-96 overflow-auto">
                {voters.map((v) => (
                  <div key={v.id} className="grid grid-cols-3 gap-2 text-sm border-b py-2">
                    <span className="truncate">{v.email}</span>
                    <code className="text-xs">{v.voting_code}</code>
                    <span className={v.code_used ? "text-success" : "text-muted-foreground"}>
                      {v.code_used ? "Used" : "Unused"}
                    </span>
                  </div>
                ))}
                {voters.length === 0 && <p className="text-sm text-muted-foreground">No voters yet.</p>}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminElectionDetail;
