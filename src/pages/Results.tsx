import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Pie, PieChart, Legend } from "recharts";
import { ParliamentChart } from "@/components/ParliamentChart";
import {
  ArrowLeft, Crown, Activity, Users, Vote as VoteIcon, ShieldCheck,
  TrendingUp, Download, Share2,
} from "lucide-react";
import { toast } from "sonner";

interface Position { id: string; title: string; }
interface Candidate { id: string; position_id: string; name: string; photo_url?: string | null; }
interface Vote { position_id: string; candidate_id: string; voter_id?: string; }

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
  "hsl(280 65% 60%)",
];

const statusTone: Record<string, string> = {
  open: "bg-success/15 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
  draft: "bg-secondary text-secondary-foreground border-border",
};

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voterCount, setVoterCount] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: e } = await supabase.from("elections").select("*").eq("id", id).maybeSingle();
      setElection(e);
      const { data: pos } = await supabase.from("positions").select("id,title").eq("election_id", id).order("display_order");
      setPositions((pos ?? []) as Position[]);
      const positionIds = (pos ?? []).map((p) => p.id);
      if (positionIds.length) {
        const { data: cand } = await supabase.from("candidates").select("id,position_id,name,photo_url").in("position_id", positionIds);
        setCandidates((cand ?? []) as Candidate[]);
      }
      const { data: v } = await supabase.from("votes").select("position_id,candidate_id,voter_id").eq("election_id", id);
      setVotes((v ?? []) as Vote[]);
      setVotedCount(new Set((v ?? []).map((x: any) => x.voter_id)).size);
      const { count } = await supabase.from("voter_list").select("id", { count: "exact", head: true }).eq("election_id", id);
      setVoterCount(count ?? 0);
    };
    load();

    const ch = supabase.channel(`votes-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes", filter: `election_id=eq.${id}` }, () => {
        setLive(true);
        load();
        setTimeout(() => setLive(false), 1500);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const turnout = voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0;

  const overallLeaders = useMemo(() => {
    return positions.map((pos) => {
      const data = candidates
        .filter((c) => c.position_id === pos.id)
        .map((c) => ({ ...c, votes: votes.filter((v) => v.candidate_id === c.id).length }))
        .sort((a, b) => b.votes - a.votes);
      const total = data.reduce((s, d) => s + d.votes, 0);
      return { pos, data, total };
    });
  }, [positions, candidates, votes]);

  const exportCsv = () => {
    const rows: string[] = ["Position,Candidate,Votes,Percentage"];
    overallLeaders.forEach(({ pos, data, total }) => {
      data.forEach((c) => {
        const pct = total ? ((c.votes / total) * 100).toFixed(1) : "0.0";
        rows.push(`"${pos.title}","${c.name}",${c.votes},${pct}%`);
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${election?.title?.replace(/\s+/g, "-") || "results"}.csv`;
    a.click();
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: election?.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Results link copied");
      }
    } catch {}
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-5xl">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Back to dashboard</Link>
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {election?.status && (
                <Badge variant="outline" className={statusTone[election.status]}>
                  {election.status}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1.5">
                <span className={`h-2 w-2 rounded-full ${live ? "bg-success animate-pulse" : "bg-success/70"}`} />
                Live results
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{election?.title || "Results"}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Updates instantly as votes come in.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={share}><Share2 className="h-4 w-4 mr-1.5" />Share</Button>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" />CSV</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total ballots", value: votes.length, icon: VoteIcon, tone: "text-primary" },
            { label: "Voters cast", value: votedCount, icon: Users, tone: "text-accent" },
            { label: "Approved voters", value: voterCount, icon: ShieldCheck, tone: "text-primary" },
            { label: "Turnout", value: `${turnout}%`, icon: TrendingUp, tone: "text-accent" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.tone}`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums">{s.value}</p>
              {s.label === "Turnout" && <Progress value={turnout} className="h-1 mt-2" />}
            </Card>
          ))}
        </div>

        {/* Winner hero — top position */}
        {overallLeaders[0] && overallLeaders[0].total > 0 && overallLeaders[0].data[0] && (() => {
          const { pos, data, total } = overallLeaders[0];
          const winner = data[0];
          const runner = data[1];
          const winPct = total ? (winner.votes / total) * 100 : 0;
          const margin = runner ? winner.votes - runner.votes : winner.votes;
          return (
            <Card className="overflow-hidden mb-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-background">
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
                  <Crown className="h-4 w-4" /> WINNER · {pos.title}
                </div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight break-words mb-1">{winner.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {winner.votes} {winner.votes === 1 ? "vote" : "votes"} · Leading by {margin}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl sm:text-5xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                      {winPct.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">vote share</p>
                  </div>
                </div>
                {data.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6">
                    {data.slice(0, 3).map((c, i) => {
                      const pct = total ? (c.votes / total) * 100 : 0;
                      const ranks = ["#1 Winner", "#2 Runner-up", "#3 Third"];
                      const tones = ["border-amber-500/40 bg-amber-500/5", "border-border", "border-border"];
                      return (
                        <div key={c.id} className={`rounded-lg border p-3 ${tones[i]}`}>
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{ranks[i]}</p>
                          <p className="font-semibold truncate">{c.name}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 tabular-nums">
                            <span>{c.votes} votes</span><span>{pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.6)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          );
        })()}

        {/* Per-position */}
        <div className="space-y-6">
          {overallLeaders.map(({ pos, data, total }) => {
            const leader = data[0];
            const runner = data[1];
            const lead = leader && runner ? leader.votes - runner.votes : leader?.votes ?? 0;
            const colored = data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }));
            return (
              <Card key={pos.id} className="overflow-hidden">
                <div className="p-5 sm:p-6 border-b bg-muted/30 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">{pos.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {total} {total === 1 ? "vote" : "votes"} cast
                    </p>
                  </div>
                  {leader && total > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">Leading:</span>
                      <span className="font-semibold">{leader.name}</span>
                      {runner && <span className="text-muted-foreground">· +{lead}</span>}
                    </div>
                  )}
                </div>

                {/* Result insights strip */}
                {total > 0 && (
                  <div className="grid grid-cols-3 divide-x border-b bg-background">
                    <div className="p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Lead margin</p>
                      <p className="text-base sm:text-lg font-bold tabular-nums mt-0.5">
                        {lead} <span className="text-xs font-normal text-muted-foreground">votes</span>
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Participation</p>
                      <p className="text-base sm:text-lg font-bold tabular-nums mt-0.5">{turnout}%</p>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                      <p className="text-base sm:text-lg font-bold capitalize mt-0.5">{election?.status ?? "—"}</p>
                    </div>
                  </div>
                )}

                <Tabs defaultValue="bars" className="p-5 sm:p-6">
                  <TabsList className="mb-4 flex-wrap h-auto">
                    <TabsTrigger value="bars">Leaderboard</TabsTrigger>
                    <TabsTrigger value="chart">Bar</TabsTrigger>
                    <TabsTrigger value="donut">Donut</TabsTrigger>
                    <TabsTrigger value="seats">Seats</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bars" className="space-y-3 mt-0">
                    {colored.length === 0 && <p className="text-sm text-muted-foreground">No candidates.</p>}
                    {colored.map((c, i) => {
                      const pct = total ? (c.votes / total) * 100 : 0;
                      return (
                        <div key={c.id} className="group">
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                              <span className="font-medium truncate">{c.name}</span>
                              {i === 0 && total > 0 && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="tabular-nums text-muted-foreground">{c.votes}</span>
                              <span className="tabular-nums font-semibold w-12 text-right">{pct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: c.fill }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="chart" className="mt-0">
                    <div className="h-64">
                      <ResponsiveContainer>
                        <BarChart data={colored}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                            {colored.map((c, i) => <Cell key={i} fill={c.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="donut" className="mt-0">
                    <div className="h-64">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={colored}
                            dataKey="votes"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke="hsl(var(--background))"
                          >
                            {colored.map((c, i) => <Cell key={i} fill={c.fill} />)}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="seats" className="mt-0">
                    <p className="text-xs text-center text-muted-foreground mb-2">Parliament seat distribution</p>
                    <ParliamentChart data={data.map((d) => ({ name: d.name, votes: d.votes, color: "" }))} totalSeats={60} />
                  </TabsContent>
                </Tabs>
              </Card>
            );
          })}

          {positions.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
              No positions yet.
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Results;
