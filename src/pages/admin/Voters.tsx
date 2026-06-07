import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Upload, Download, Copy, RotateCw, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const randomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .replace(/(.{4})/, "$1-");

const Voters = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [electionId, setElectionId] = useState<string>("");
  const [voters, setVoters] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("elections")
      .select("id,title")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setElections(data ?? []);
        if (data?.[0]) setElectionId(data[0].id);
      });
  }, []);

  const load = async () => {
    if (!electionId) return;
    const { data } = await supabase
      .from("voter_list")
      .select("*")
      .eq("election_id", electionId)
      .order("created_at", { ascending: false });
    setVoters(data ?? []);
    setSelected(new Set());
  };

  useEffect(() => { load(); }, [electionId]);

  const filtered = useMemo(
    () => voters.filter((v) => !query || v.email.toLowerCase().includes(query.toLowerCase())),
    [voters, query],
  );

  const importCsv = async (file: File) => {
    const text = await file.text();
    const emails = text
      .split(/[\n,;]/)
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
    if (!emails.length) return toast.error("No valid emails found in CSV");
    const rows = emails.map((email) => ({ election_id: electionId, email, voting_code: randomCode() }));
    const { error } = await supabase.from("voter_list").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${rows.length} voters`);
    load();
  };

  const exportCsv = () => {
    const csv = ["email,voting_code,used", ...voters.map((v) => `${v.email},${v.voting_code},${v.code_used}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voters-${electionId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  const regenerate = async (id: string) => {
    const { error } = await supabase
      .from("voter_list")
      .update({ voting_code: randomCode(), code_used: false, used_at: null, user_id: null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Code regenerated");
    load();
  };

  const remove = async (ids: string[]) => {
    const { error } = await supabase.from("voter_list").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${ids.length} voter${ids.length > 1 ? "s" : ""}`);
    load();
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map((v) => v.id)) : new Set());
  };

  return (
    <AdminGuard>
      <AdminLayout title="Voters">
        <Card className="border-border/60">
          <CardHeader className="flex flex-col gap-3 pb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">Voter list</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={electionId} onValueChange={setElectionId}>
                  <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Select election" /></SelectTrigger>
                  <SelectContent>
                    {elections.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
                  />
                  <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4" />Import CSV</span></Button>
                </label>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={!voters.length}>
                  <Download className="h-4 w-4" />Export
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8 h-9" placeholder="Search by email…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              {selected.size > 0 && (
                <Button variant="destructive" size="sm" onClick={() => remove(Array.from(selected))}>
                  <Trash2 className="h-4 w-4" />Delete {selected.size}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="border border-dashed rounded-lg p-10 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No voters yet. Import a CSV of emails to get started.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onCheckedChange={(c) => toggleAll(!!c)}
                        />
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-40">Voting code</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-32">Added</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(v.id)}
                            onCheckedChange={(c) => {
                              const next = new Set(selected);
                              c ? next.add(v.id) : next.delete(v.id);
                              setSelected(next);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{v.email}</TableCell>
                        <TableCell className="font-mono text-xs">{v.voting_code}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={v.code_used ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : ""}>
                            {v.code_used ? "Used" : "Unused"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(v.voting_code)} title="Copy code">
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => regenerate(v.id)} title="Regenerate code">
                              <RotateCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove([v.id])} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Voters;
