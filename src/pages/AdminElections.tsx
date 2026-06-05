import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Vote,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  ArrowUpRight,
  Activity,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LEGACY_CREATOR = "7ebcdf88-10aa-4929-9fa6-00cc95c9213d";

const statusStyle: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const AdminElections = () => {
  const { user, loading, isAdmin } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [voterCount, setVoterCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "open" | "closed">("all");

  const load = async () => {
    const { data } = await supabase
      .from("elections")
      .select("*")
      .neq("created_by", LEGACY_CREATOR)
      .order("created_at", { ascending: false });
    setElections(data ?? []);

    const { count: vc } = await supabase
      .from("voter_list")
      .select("*", { count: "exact", head: true });
    setVoterCount(vc ?? 0);

    const { count: vtc } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true });
    setVoteCount(vtc ?? 0);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const draft = elections.filter((e) => e.status === "draft").length;
    const openCt = elections.filter((e) => e.status === "open").length;
    const closed = elections.filter((e) => e.status === "closed").length;
    return { total: elections.length, draft, open: openCt, closed };
  }, [elections]);

  const filtered = useMemo(() => {
    return elections.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [elections, statusFilter, query]);

  if (loading)
    return (
      <AdminLayout title="Admin">
        <div className="text-muted-foreground">Loading…</div>
      </AdminLayout>
    );
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin)
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h2 className="font-semibold mb-1">Admins only</h2>
          <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </Card>
      </AdminLayout>
    );

  const create = async () => {
    if (!title.trim()) return;
    const { error } = await supabase
      .from("elections")
      .insert({ title: title.trim(), description: description.trim() || null, created_by: user.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Election created");
    setOpen(false);
    setTitle("");
    setDescription("");
    load();
  };

  return (
    <AdminLayout
      title="Overview"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              New election
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create election</DialogTitle>
              <DialogDescription>Set a title and short description. You can configure positions, candidates, and voters after.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="el-title">Title</Label>
                <Input id="el-title" placeholder="2026 Society Election" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="el-desc">Description</Label>
                <Textarea id="el-desc" placeholder="Optional context for voters" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create}>Create election</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile icon={Vote} label="Total elections" value={stats.total} accent="text-foreground" />
        <StatTile icon={Activity} label="Live" value={stats.open} accent="text-emerald-600 dark:text-emerald-400" />
        <StatTile icon={Users} label="Registered voters" value={voterCount} accent="text-foreground" />
        <StatTile icon={CheckCircle2} label="Votes cast" value={voteCount} accent="text-foreground" />
      </div>

      {/* Status quick filters */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0 pb-4">
          <div>
            <CardTitle className="text-base">Elections</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Manage active and past elections.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search elections…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-3 overflow-x-auto">
            {(["all", "draft", "open", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap",
                  statusFilter === s
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {s === "all" ? "All" : s}
                <span className="ml-1.5 text-muted-foreground">
                  {s === "all" ? stats.total : (stats as any)[s]}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState onCreate={() => setOpen(true)} hasAny={elections.length > 0} />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid sm:hidden gap-2">
                {filtered.map((e) => (
                  <Link
                    key={e.id}
                    to={`/admin/election/${e.id}`}
                    className="block rounded-lg border border-border/60 p-3 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{e.title}</h3>
                      <Badge variant="outline" className={cn("capitalize text-[10px] shrink-0", statusStyle[e.status])}>
                        {e.status}
                      </Badge>
                    </div>
                    {e.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(e.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block rounded-lg border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Election</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="w-40">Schedule</TableHead>
                      <TableHead className="w-32">Created</TableHead>
                      <TableHead className="w-20 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id} className="group">
                        <TableCell>
                          <div className="font-medium">{e.title}</div>
                          {e.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-md">{e.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("capitalize", statusStyle[e.status])}>{e.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.start_at ? (
                            <span>
                              {new Date(e.start_at).toLocaleDateString()}
                              {e.end_at && <> → {new Date(e.end_at).toLocaleDateString()}</>}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/election/${e.id}`}>
                              Manage
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

const StatTile = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  accent?: string;
}) => (
  <Card className="border-border/60">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <Icon className={cn("h-4 w-4 text-muted-foreground", accent)} />
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums", accent)}>{value}</div>
    </CardContent>
  </Card>
);

const EmptyState = ({ onCreate, hasAny }: { onCreate: () => void; hasAny: boolean }) => (
  <div className="border border-dashed border-border rounded-lg p-10 text-center">
    <div className="mx-auto h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
      <FileText className="h-5 w-5 text-muted-foreground" />
    </div>
    <h3 className="font-medium">{hasAny ? "No elections match your filters" : "No elections yet"}</h3>
    <p className="text-sm text-muted-foreground mt-1 mb-4">
      {hasAny ? "Try clearing search or status filters." : "Create your first election to get started."}
    </p>
    {!hasAny && (
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4" />
        New election
      </Button>
    )}
  </div>
);

export default AdminElections;
