import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Vote,
  Users,
  CheckCircle2,
  Activity,
  PieChart,
  Plus,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const Overview = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [voterCount, setVoterCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: el }, { count: vc }, { count: vtc }, { data: logs }] = await Promise.all([
        supabase.from("elections").select("*").order("created_at", { ascending: false }),
        supabase.from("voter_list").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      setElections(el ?? []);
      setVoterCount(vc ?? 0);
      setVoteCount(vtc ?? 0);
      setActivity(logs ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = elections.length;
    const open = elections.filter((e) => e.status === "open").length;
    const closed = elections.filter((e) => e.status === "closed").length;
    const draft = elections.filter((e) => e.status === "draft").length;
    const participation = voterCount > 0 ? Math.round((voteCount / voterCount) * 100) : 0;
    return { total, open, closed, draft, participation };
  }, [elections, voteCount, voterCount]);

  return (
    <AdminGuard>
      <AdminLayout
        title="Overview"
        actions={
          <Button asChild>
            <Link to="/admin/elections">
              <Plus className="h-4 w-4" />
              New election
            </Link>
          </Button>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 items-stretch">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/60 h-full animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-7 w-14 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Tile icon={Vote} label="Total elections" value={stats.total} trend={stats.total > 0 ? `${stats.total} active` : "None yet"} />
              <Tile icon={Activity} label="Active" value={stats.open} accent="text-emerald-600 dark:text-emerald-400" trend={stats.open > 0 ? "Live now" : "0 open"} trendTone="emerald" />
              <Tile icon={Users} label="Registered voters" value={voterCount} />
              <Tile icon={CheckCircle2} label="Votes cast" value={voteCount} />
              <Tile icon={PieChart} label="Participation" value={`${stats.participation}%`} trend={stats.participation >= 50 ? "Healthy turnout" : "Below target"} trendTone={stats.participation >= 50 ? "emerald" : "muted"} />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-base">Election status</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/elections">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <StatusBlock label="Draft" value={stats.draft} tone="muted" />
                <StatusBlock label="Open" value={stats.open} tone="emerald" />
                <StatusBlock label="Closed" value={stats.closed} tone="rose" />
              </div>
              <div className="border-t border-border/60 pt-3 space-y-1.5">
                {elections.slice(0, 5).map((e) => (
                  <Link
                    key={e.id}
                    to={`/admin/election/${e.id}`}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{e.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(e.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize shrink-0", statusStyle[e.status])}>{e.status}</Badge>
                  </Link>
                ))}
                {elections.length === 0 && !loading && (
                  <div className="border border-dashed border-border rounded-lg p-8 text-center">
                    <div className="mx-auto h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                      <Vote className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No elections yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">Create one to start collecting votes.</p>
                    <Button size="sm" asChild><Link to="/admin/elections"><Plus className="h-3.5 w-3.5" />New election</Link></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse border-l-2 border-border pl-3 py-0.5 space-y-1">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-2.5 w-20 bg-muted rounded" />
                </div>
              ))}
              {!loading && activity.length === 0 && (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                </div>
              )}
              {activity.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-border pl-3 py-0.5">
                  <p className="font-medium text-foreground">{log.action}</p>
                  <p className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 mt-4">
          <CardHeader className="pb-3"><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-2">
            <Button variant="outline" asChild className="justify-start"><Link to="/admin/elections">Manage elections</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link to="/admin/voters">Manage voters</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link to="/admin/results">View results</Link></Button>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
};

const Tile = ({ icon: Icon, label, value, accent, trend, trendTone }: any) => (
  <Card className="border-border/60 h-full transition-shadow hover:shadow-sm">
    <CardContent className="p-4 h-full flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <Icon className={cn("h-4 w-4 text-muted-foreground", accent)} />
      </div>
      <div>
        <div className={cn("text-2xl font-semibold tabular-nums leading-none", accent)}>{value}</div>
        {trend && (
          <div className={cn(
            "text-[11px] mt-2 font-medium",
            trendTone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
          )}>
            {trend}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const StatusBlock = ({ label, value, tone }: { label: string; value: number; tone: "muted" | "emerald" | "rose" }) => {
  const cls =
    tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : tone === "rose"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : "bg-secondary text-foreground";
  return (
    <div className={cn("rounded-lg p-3", cls)}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-xl font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
};

export default Overview;
