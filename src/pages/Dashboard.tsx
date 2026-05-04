import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight, BarChart3 } from "lucide-react";
import { format } from "date-fns";

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "open" | "closed";
  start_at: string | null;
  end_at: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-success text-success-foreground",
  closed: "bg-secondary text-secondary-foreground",
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: el } = await supabase.from("elections").select("*").order("created_at", { ascending: false });
      setElections((el ?? []) as Election[]);
      const { data: v } = await supabase.from("votes").select("election_id").eq("voter_id", user.id);
      setVoted(new Set((v ?? []).map((r) => r.election_id)));
    })();
  }, [user]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Elections</h1>
        <p className="text-muted-foreground mb-8">Cast your vote in elections you've been approved for.</p>

        {elections.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No elections yet.</Card>
        ) : (
          <div className="grid gap-4">
            {elections.map((e) => {
              const hasVoted = voted.has(e.id);
              return (
                <Card key={e.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{e.title}</h3>
                        <Badge className={statusColors[e.status]}>{e.status}</Badge>
                        {hasVoted && <Badge variant="outline">Voted</Badge>}
                      </div>
                      {e.description && <p className="text-sm text-muted-foreground mb-2">{e.description}</p>}
                      {(e.start_at || e.end_at) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {e.start_at && format(new Date(e.start_at), "PP")}
                          {e.end_at && ` → ${format(new Date(e.end_at), "PP")}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/election/${e.id}/results`}><BarChart3 className="h-4 w-4 mr-1" />Results</Link>
                      </Button>
                      {e.status === "open" && !hasVoted && (
                        <Button size="sm" asChild>
                          <Link to={`/election/${e.id}/code`}>Vote <ArrowRight className="h-4 w-4 ml-1" /></Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
