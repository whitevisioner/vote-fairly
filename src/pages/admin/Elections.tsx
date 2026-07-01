import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  ArrowUpRight,
  FileText,
  MoreHorizontal,
  Eye,
  Copy as CopyIcon,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const PAGE_SIZE = 10;

const Elections = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "open" | "closed">("all");
  const [sortKey, setSortKey] = useState<"created_at" | "title" | "status">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("elections").select("*");
    setElections(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = elections.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [elections, statusFilter, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const create = async () => {
    if (!title.trim() || !user) return;
    const { error } = await supabase
      .from("elections")
      .insert({ title: title.trim(), description: description.trim() || null, created_by: user.id });
    if (error) return toast.error(error.message);
    toast.success("Election created");
    setOpen(false);
    setTitle("");
    setDescription("");
    load();
  };

  const duplicate = async (e: any) => {
    if (!user) return;
    const { error } = await supabase.from("elections").insert({
      title: `${e.title} (copy)`,
      description: e.description,
      created_by: user.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Election duplicated");
    load();
  };

  const archive = async (e: any) => {
    const { error } = await supabase.from("elections").update({ status: "closed" }).eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Election archived");
    load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.rpc("delete_election_cascade", { _election_id: deleteTarget.id });
    if (error) return toast.error(error.message);
    toast.success("Election deleted");
    setDeleteTarget(null);
    load();
  };

  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  return (
    <AdminGuard>
      <AdminLayout
        title="Elections"
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
        <Card className="border-border/60">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0 pb-4 sticky top-14 z-20 bg-card/95 backdrop-blur border-b border-border/60 rounded-t-xl">
            <div className="min-w-0">
              <CardTitle className="text-base">All elections</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Search, sort, and manage every election.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  aria-label="Search elections"
                  placeholder="Search elections…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
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
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap",
                    statusFilter === s
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-10 text-center">
                <div className="mx-auto h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No elections match your filters</h3>
                <p className="text-sm text-muted-foreground mt-1">Try clearing search or status filters.</p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="grid sm:hidden gap-2.5">
                  {paged.map((e) => (
                    <div key={e.id} className="rounded-lg border border-border/60 p-3 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link to={`/admin/election/${e.id}`} className="font-medium text-sm break-words hover:underline flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                          {e.title}
                        </Link>
                        <Badge variant="outline" className={cn("capitalize text-[10px] shrink-0", statusStyle[e.status])}>{e.status}</Badge>
                      </div>
                      {e.description && <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{e.description}</p>}
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 min-h-11"><Link to={`/admin/election/${e.id}`}>Manage</Link></Button>
                        <RowMenu e={e} onDuplicate={duplicate} onArchive={archive} onDelete={setDeleteTarget} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>
                          <button onClick={() => toggleSort("title")} className="inline-flex items-center gap-1 hover:text-foreground">
                            Election <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="w-28">
                          <button onClick={() => toggleSort("status")} className="inline-flex items-center gap-1 hover:text-foreground">
                            Status <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="w-32">
                          <button onClick={() => toggleSort("created_at")} className="inline-flex items-center gap-1 hover:text-foreground">
                            Created <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.map((e) => (
                        <TableRow key={e.id} className="group">
                          <TableCell>
                            <div className="font-medium">{e.title}</div>
                            {e.description && <div className="text-xs text-muted-foreground truncate max-w-md">{e.description}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("capitalize", statusStyle[e.status])}>{e.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(e.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/election/${e.id}`}>Manage <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                              </Button>
                              <RowMenu e={e} onDuplicate={duplicate} onArchive={archive} onDelete={setDeleteTarget} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 text-xs text-muted-foreground">
                  <div>Showing {paged.length} of {filtered.length}</div>
                  <div className="flex items-center justify-between sm:justify-end gap-1">
                    <Button variant="outline" size="icon" aria-label="Previous page" className="h-8 w-8 min-h-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="px-2 tabular-nums">Page {page} / {pageCount}</span>
                    <Button variant="outline" size="icon" aria-label="Next page" className="h-8 w-8 min-h-8" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete election?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>This action will permanently remove:</p>
                  <ul className="list-disc pl-5 text-sm space-y-0.5">
                    <li>Election</li>
                    <li>Positions</li>
                    <li>Candidates</li>
                    <li>Votes</li>
                    <li>Voter codes</li>
                    <li>Analytics</li>
                  </ul>
                  <p className="text-foreground font-medium pt-2">{deleteTarget?.title}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
};

const RowMenu = ({ e, onDuplicate, onArchive, onDelete }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild><Link to={`/election/${e.id}/results`}><Eye className="h-4 w-4 mr-2" />View results</Link></DropdownMenuItem>
      <DropdownMenuItem onClick={() => onDuplicate(e)}><CopyIcon className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onArchive(e)}><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onDelete(e)} className="text-destructive focus:text-destructive">
        <Trash2 className="h-4 w-4 mr-2" />Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Elections;
