import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText } from "lucide-react";

const Audit = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      const ids = Array.from(new Set((data ?? []).map((d) => d.actor_id).filter(Boolean)));
      let emails: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id,email").in("id", ids);
        emails = Object.fromEntries((profs ?? []).map((p) => [p.id, p.email]));
      }
      setLogs((data ?? []).map((l) => ({ ...l, actor_email: l.actor_email ?? emails[l.actor_id] ?? "system" })));
    })();
  }, []);

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          !query ||
          l.action.toLowerCase().includes(query.toLowerCase()) ||
          (l.actor_email ?? "").toLowerCase().includes(query.toLowerCase()),
      ),
    [logs, query],
  );

  return (
    <AdminGuard>
      <AdminLayout title="Audit log">
        <Card className="border-border/60">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0 pb-4">
            <div>
              <CardTitle className="text-base">Activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">All administrative actions across the platform.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8 h-9" placeholder="Search action or user…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="border border-dashed rounded-lg p-10 text-center">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No activity recorded.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="w-40">Target</TableHead>
                      <TableHead className="w-44">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium text-sm">{l.actor_email ?? "—"}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono text-[10px]">{l.action}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">{l.target_table ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
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

export default Audit;
