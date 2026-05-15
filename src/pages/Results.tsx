import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Position { id: string; title: string; }
interface Candidate { id: string; position_id: string; name: string; }
interface Vote { position_id: string; candidate_id: string; }

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voterCount, setVoterCount] = useState(0);
  const [votedCount, setVotedCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: e } = await supabase.from("elections").select("*").eq("id", id).maybeSingle();
      setElection(e);
      const { data: pos } = await supabase.from("positions").select("id,title").eq("election_id", id).order("display_order");
      setPositions((pos ?? []) as Position[]);
      const positionIds = (pos ?? []).map((p) => p.id);
      if (positionIds.length) {
        const { data: cand } = await supabase.from("candidates").select("id,position_id,name").in("position_id", positionIds);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "votes", filter: `election_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const turnout = voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0;
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-1">{election?.title || "Results"}</h1>
        <p className="text-muted-foreground mb-6">Live results — updates instantly as votes come in.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="p-4"><p className="text-xs text-muted-foreground">Total ballots</p><p className="text-2xl font-bold">{votes.length}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Voters cast</p><p className="text-2xl font-bold">{votedCount}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Approved voters</p><p className="text-2xl font-bold">{voterCount}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground">Turnout</p><p className="text-2xl font-bold text-accent">{turnout}%</p></Card>
        </div>

        <div className="space-y-6">
          {positions.map((pos) => {
            const data = candidates.filter((c) => c.position_id === pos.id).map((c) => ({
              name: c.name,
              votes: votes.filter((v) => v.candidate_id === c.id).length,
            }));
            const total = data.reduce((s, d) => s + d.votes, 0);
            const leader = data.length ? data.reduce((a, b) => (a.votes > b.votes ? a : b)) : null;
            return (
              <Card key={pos.id} className="p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <h2 className="text-xl font-semibold">{pos.title}</h2>
                  <span className="text-sm text-muted-foreground">{total} votes</span>
                </div>
                {leader && total > 0 && (
                  <p className="text-sm mb-4">Leading: <span className="font-semibold text-primary">{leader.name}</span></p>
                )}
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
                      <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          })}
          {positions.length === 0 && <Card className="p-12 text-center text-muted-foreground">No positions yet.</Card>}
        </div>
      </div>
    </Layout>
  );
};

export default Results;
