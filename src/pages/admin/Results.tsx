import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, CheckCircle2, PieChart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Results = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [electionId, setElectionId] = useState<string>("");
  const [positions, setPositions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setElections(data ?? []);
        if (data?.[0]) setElectionId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!electionId) return;
    (async () => {
      const [{ data: p }, { data: v }, { data: vt }] = await Promise.all([
        supabase.from("positions").select("*").eq("election_id", electionId).order("display_order"),
        supabase.from("votes").select("*").eq("election_id", electionId),
        supabase.from("voter_list").select("*").eq("election_id", electionId),
      ]);
      setPositions(p ?? []);
      setVotes(v ?? []);
      setVoters(vt ?? []);
      const pIds = (p ?? []).map((x) => x.id);
      if (pIds.length) {
        const { data: c } = await supabase.from("candidates").select("*").in("position_id", pIds);
        setCandidates(c ?? []);
      } else setCandidates([]);
    })();
  }, [electionId]);

  const stats = useMemo(() => {
    const total = votes.length;
    const used = voters.filter((v) => v.code_used).length;
    const turnout = voters.length > 0 ? Math.round((used / voters.length) * 100) : 0;
    const participation = voters.length > 0 ? Math.round((total / voters.length) * 100) : 0;
    return { total, turnout, participation, voterCount: voters.length };
  }, [votes, voters]);

  const byPosition = useMemo(() => {
    return positions.map((p) => {
      const cs = candidates.filter((c) => c.position_id === p.id).map((c) => {
        const count = votes.filter((v) => v.candidate_id === c.id).length;
        return { ...c, count };
      });
      cs.sort((a, b) => b.count - a.count);
      const totalP = cs.reduce((s, c) => s + c.count, 0);
      const winner = cs[0];
      return { position: p, candidates: cs, totalP, winner };
    });
  }, [positions, candidates, votes]);

  const topWinner = byPosition[0]?.winner;
  const topTotal = byPosition[0]?.totalP ?? 0;

  return (
    <AdminGuard>
      <AdminLayout
        title="Results"
        actions={
          <Select value={electionId} onValueChange={setElectionId}>
            <SelectTrigger className="h-10 w-full sm:w-72 max-w-full" aria-label="Select election">
              <SelectValue placeholder="Select election" />
            </SelectTrigger>
            <SelectContent className="max-w-[calc(100vw-2rem)]">
              {elections.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  <span className="truncate block max-w-[260px]">{e.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 items-stretch">
          <Tile icon={CheckCircle2} label="Total votes" value={stats.total} />
          <Tile icon={Users} label="Turnout" value={`${stats.turnout}%`} />
          <Tile icon={PieChart} label="Participation" value={`${stats.participation}%`} />
          <Tile icon={Trophy} label="Winner" value={topWinner?.name ?? "—"} truncate />
        </div>

        {topWinner && (
          <Card className="border-border/60 mb-4 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="p-5 flex items-center gap-4 flex-wrap">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Leading winner — {byPosition[0]?.position.title}</div>
                <div className="text-xl font-semibold truncate">{topWinner.name}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold tabular-nums">{topWinner.count}</div>
                <div className="text-xs text-muted-foreground">{topTotal > 0 ? Math.round((topWinner.count / topTotal) * 100) : 0}% of votes</div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {byPosition.map(({ position, candidates: cs, totalP, winner }) => (
            <Card key={position.id} className="border-border/60">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{position.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{totalP} votes cast</p>
                </div>
                {winner && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Winner: {winner.name}</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                {cs.length === 0 && <p className="text-sm text-muted-foreground">No candidates.</p>}
                {cs.map((c, i) => {
                  const pct = totalP > 0 ? Math.round((c.count / totalP) * 100) : 0;
                  return (
                    <div key={c.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={cn("font-medium", i === 0 && c.count > 0 && "text-emerald-600 dark:text-emerald-400")}>
                          {i + 1}. {c.name}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{c.count} · {pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
          {positions.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">No positions configured for this election.</p>
            </Card>
          )}
        </div>

        {electionId && (
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link to={`/election/${electionId}/results`}>
                Open public results page <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
};

const Tile = ({ icon: Icon, label, value, truncate }: any) => (
  <Card className="border-border/60">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums", truncate && "truncate text-lg")}>{value}</div>
    </CardContent>
  </Card>
);

export default Results;
