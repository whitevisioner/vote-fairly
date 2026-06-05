import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Upload,
  Download,
  Calendar,
  Play,
  Square as StopIcon,
  FileText,
  Users,
  UserPlus,
  Activity,
  AlertTriangle,
  Copy,
  Vote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const randomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .replace(/(.{4})/, "$1-");

const statusStyle: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const AdminElectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [election, setElection] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // forms
  const [posTitle, setPosTitle] = useState("");
  const [posDesc, setPosDesc] = useState("");
  const [candForms, setCandForms] = useState<
    Record<string, { name: string; bio: string; manifesto: string; file?: File }>
  >({});
  const [voterEmails, setVoterEmails] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = async () => {
    const { data: e } = await supabase.from("elections").select("*").eq("id", id).maybeSingle();
    setElection(e);
    const { data: pos } = await supabase
      .from("positions")
      .select("*")
      .eq("election_id", id)
      .order("display_order");
    setPositions(pos ?? []);
    const ids = (pos ?? []).map((p) => p.id);
    if (ids.length) {
      const { data: c } = await supabase.from("candidates").select("*").in("position_id", ids);
      setCandidates(c ?? []);
    } else setCandidates([]);
    const { data: vl } = await supabase
      .from("voter_list")
      .select("*")
      .eq("election_id", id)
      .order("created_at");
    setVoters(vl ?? []);
    const { data: al } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    setAuditLogs(al ?? []);
  };

  useEffect(() => {
    if (isAdmin && id) load();
  }, [isAdmin, id]);

  const stats = useMemo(() => {
    const used = voters.filter((v) => v.code_used).length;
    return {
      positions: positions.length,
      candidates: candidates.length,
      voters: voters.length,
      turnout: voters.length ? Math.round((used / voters.length) * 100) : 0,
    };
  }, [positions, candidates, voters]);

  if (loading)
    return (
      <AdminLayout>
        <div className="text-muted-foreground">Loading…</div>
      </AdminLayout>
    );
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const writeAudit = async (action: string, details: any = {}) => {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email,
      action,
      target_table: "elections",
      target_id: id,
      details,
    });
  };

  const updateStatus = async (status: "draft" | "open" | "closed") => {
    const { error } = await supabase
      .from("elections")
      .update({ status })
      .eq("id", id!);
    if (error) {
      toast.error(error.message);
      return;
    }
    await writeAudit("status.changed", { from: election?.status, to: status });
    toast.success(`Election ${status === "open" ? "opened" : status === "closed" ? "closed" : "moved to draft"}`);
    load();
  };

  const updateSchedule = async (start_at: string | null, end_at: string | null) => {
    const { error } = await supabase
      .from("elections")
      .update({ start_at, end_at })
      .eq("id", id!);
    if (error) toast.error(error.message);
    else {
      await writeAudit("schedule.updated", { start_at, end_at });
      toast.success("Schedule saved");
      load();
    }
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const emails = text
      .split(/[\s,;\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.includes("@"));
    if (!emails.length) {
      toast.error("No valid emails found");
      return;
    }
    const rows = emails.map((email) => ({ election_id: id!, email, voting_code: randomCode() }));
    const { error } = await supabase.from("voter_list").insert(rows);
    if (error) toast.error(error.message);
    else {
      await writeAudit("voters.imported", { count: emails.length });
      toast.success(`${emails.length} voters imported`);
      load();
    }
  };

  const addPosition = async () => {
    if (!posTitle.trim()) return;
    const { error } = await supabase.from("positions").insert({
      election_id: id!,
      title: posTitle.trim(),
      description: posDesc.trim() || null,
      display_order: positions.length,
    });
    if (error) toast.error(error.message);
    else {
      setPosTitle("");
      setPosDesc("");
      load();
    }
  };

  const deletePosition = async (pid: string) => {
    if (!confirm("Delete this position and its candidates?")) return;
    await supabase.from("candidates").delete().eq("position_id", pid);
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
      if (ue) {
        toast.error(ue.message);
        return;
      }
      photo_url = supabase.storage.from("candidate-photos").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("candidates").insert({
      position_id: positionId,
      name: f.name.trim(),
      bio: f.bio?.trim() || null,
      manifesto: f.manifesto?.trim() || null,
      photo_url,
    });
    if (error) toast.error(error.message);
    else {
      setCandForms({ ...candForms, [positionId]: { name: "", bio: "", manifesto: "" } });
      load();
    }
  };

  const deleteCandidate = async (cid: string) => {
    await supabase.from("candidates").delete().eq("id", cid);
    load();
  };

  const addVoters = async () => {
    const emails = voterEmails
      .split(/[\s,;\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!emails.length) return;
    const rows = emails.map((email) => ({ election_id: id!, email, voting_code: randomCode() }));
    const { error } = await supabase.from("voter_list").insert(rows);
    if (error) toast.error(error.message);
    else {
      await writeAudit("voters.added", { count: emails.length });
      toast.success(`${emails.length} voters added`);
      setVoterEmails("");
      load();
    }
  };

  const exportCodes = () => {
    const csv =
      "email,voting_code,used\n" +
      voters.map((v) => `${v.email},${v.voting_code},${v.code_used}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${election?.title}-voters.csv`;
    a.click();
  };

  const deleteElection = async () => {
    const { error } = await supabase.rpc("delete_election_cascade", { _election_id: id! });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Election deleted");
    navigate("/admin");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  return (
    <AdminLayout
      breadcrumb={[{ label: "Elections", to: "/admin" }, { label: election?.title ?? "…" }]}
      title={election?.title}
      actions={
        <div className="flex items-center gap-2">
          {election?.status && (
            <Badge variant="outline" className={cn("capitalize", statusStyle[election.status])}>
              {election.status}
            </Badge>
          )}
          {election?.status === "draft" && (
            <Button size="sm" onClick={() => updateStatus("open")}>
              <Play className="h-4 w-4" />
              Open voting
            </Button>
          )}
          {election?.status === "open" && (
            <Button size="sm" variant="secondary" onClick={() => updateStatus("closed")}>
              <StopIcon className="h-4 w-4" />
              Close voting
            </Button>
          )}
          {election?.status === "closed" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("draft")}>
              Reopen as draft
            </Button>
          )}
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Positions" value={stats.positions} icon={FileText} />
        <StatTile label="Candidates" value={stats.candidates} icon={Vote} />
        <StatTile label="Voters" value={stats.voters} icon={Users} />
        <StatTile label="Turnout" value={`${stats.turnout}%`} icon={Activity} />
      </div>

      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        {/* Positions */}
        <TabsContent value="positions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add position</CardTitle>
              <CardDescription>Each position holds its own set of candidates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. President"
                    value={posTitle}
                    onChange={(e) => setPosTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional"
                    value={posDesc}
                    onChange={(e) => setPosDesc(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={addPosition} disabled={!posTitle.trim()}>
                Add position
              </Button>
            </CardContent>
          </Card>

          {positions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground text-sm">No positions yet. Add one above to get started.</p>
              </CardContent>
            </Card>
          ) : (
            positions.map((pos) => (
              <Card key={pos.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{pos.title}</CardTitle>
                    {pos.description && <CardDescription>{pos.description}</CardDescription>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deletePosition(pos.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {candidates
                      .filter((c) => c.position_id === pos.id)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {c.photo_url ? (
                              <img
                                src={c.photo_url}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium truncate">{c.name}</div>
                              {c.bio && (
                                <div className="text-xs text-muted-foreground truncate">{c.bio}</div>
                              )}
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => deleteCandidate(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    {candidates.filter((c) => c.position_id === pos.id).length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">No candidates yet.</p>
                    )}
                  </div>

                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Add candidate</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Name"
                        value={candForms[pos.id]?.name || ""}
                        onChange={(e) =>
                          setCandForms({
                            ...candForms,
                            [pos.id]: { ...candForms[pos.id], name: e.target.value },
                          })
                        }
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCandForms({
                            ...candForms,
                            [pos.id]: { ...candForms[pos.id], file: e.target.files?.[0] },
                          })
                        }
                      />
                      <Input
                        placeholder="Short bio"
                        value={candForms[pos.id]?.bio || ""}
                        onChange={(e) =>
                          setCandForms({
                            ...candForms,
                            [pos.id]: { ...candForms[pos.id], bio: e.target.value },
                          })
                        }
                      />
                      <Textarea
                        placeholder="Manifesto"
                        value={candForms[pos.id]?.manifesto || ""}
                        onChange={(e) =>
                          setCandForms({
                            ...candForms,
                            [pos.id]: { ...candForms[pos.id], manifesto: e.target.value },
                          })
                        }
                      />
                    </div>
                    <Button className="mt-2" size="sm" onClick={() => addCandidate(pos.id)}>
                      <UserPlus className="h-4 w-4" />
                      Add candidate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Voters */}
        <TabsContent value="voters" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add approved voters</CardTitle>
              <CardDescription>
                Paste emails (comma, space, or newline separated). A unique voting code is generated for each.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={4}
                value={voterEmails}
                onChange={(e) => setVoterEmails(e.target.value)}
                placeholder="alice@example.com, bob@example.com"
              />
              <div className="flex gap-2 flex-wrap">
                <Button onClick={addVoters} disabled={!voterEmails.trim()}>
                  <UserPlus className="h-4 w-4" />
                  Add voters
                </Button>
                <Button asChild variant="secondary">
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import CSV
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
                    />
                  </label>
                </Button>
                <Button variant="outline" onClick={exportCodes} disabled={voters.length === 0}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Voter list <span className="text-muted-foreground font-normal">({voters.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-[28rem] overflow-auto">
                  {voters.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-6 text-center">No voters yet.</p>
                  ) : (
                    voters.map((v, idx) => (
                      <div
                        key={v.id}
                        className={cn(
                          "grid grid-cols-[1fr_auto_auto] gap-3 items-center px-3 py-2.5 text-sm",
                          idx !== voters.length - 1 && "border-b border-border/60",
                        )}
                      >
                        <span className="truncate">{v.email}</span>
                        <button
                          onClick={() => copyCode(v.voting_code)}
                          className="font-mono text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 inline-flex items-center gap-1.5"
                          title="Copy code"
                        >
                          {v.voting_code}
                          <Copy className="h-3 w-3 opacity-60" />
                        </button>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            v.code_used
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "",
                          )}
                        >
                          {v.code_used ? "Used" : "Unused"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Election schedule
              </CardTitle>
              <CardDescription>
                Set when voting opens and closes. Times are in your local timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start_at">Start</Label>
                  <Input
                    type="datetime-local"
                    defaultValue={
                      election?.start_at
                        ? new Date(election.start_at).toISOString().slice(0, 16)
                        : ""
                    }
                    id="start_at"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_at">End</Label>
                  <Input
                    type="datetime-local"
                    defaultValue={
                      election?.end_at
                        ? new Date(election.end_at).toISOString().slice(0, 16)
                        : ""
                    }
                    id="end_at"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  const s = (document.getElementById("start_at") as HTMLInputElement)?.value;
                  const e = (document.getElementById("end_at") as HTMLInputElement)?.value;
                  updateSchedule(s ? new Date(s).toISOString() : null, e ? new Date(e).toISOString() : null);
                }}
              >
                Save schedule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent activity
              </CardTitle>
              <CardDescription>The last 20 admin actions on this election.</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
              ) : (
                <ol className="space-y-3">
                  {auditLogs.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{a.action}</code>
                          <span className="text-muted-foreground text-xs">
                            {new Date(a.created_at).toLocaleString()}
                          </span>
                        </div>
                        {a.actor_email && (
                          <p className="text-xs text-muted-foreground mt-0.5">by {a.actor_email}</p>
                        )}
                        {a.details && Object.keys(a.details).length > 0 && (
                          <pre className="text-[11px] text-muted-foreground mt-1 bg-secondary/40 rounded px-2 py-1 overflow-auto">
                            {JSON.stringify(a.details)}
                          </pre>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger zone */}
        <TabsContent value="danger" className="mt-4">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Danger zone
              </CardTitle>
              <CardDescription>
                Permanently delete this election and all related positions, candidates, voters, and cast votes.
                This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete election
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this election?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All positions, candidates, voters, and cast votes will be permanently removed. To confirm,
                      type the election title:{" "}
                      <span className="font-semibold text-foreground">{election?.title}</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    autoFocus
                    placeholder="Type title to confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteConfirm !== election?.title}
                      onClick={deleteElection}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

const StatTile = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: any;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </CardContent>
  </Card>
);

export default AdminElectionDetail;
