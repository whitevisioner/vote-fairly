import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays, ArrowRight, BarChart3, Users, CheckCircle2, Vote as VoteIcon,
  TrendingUp, FileText, Inbox, Bell, Activity, Building2, ShieldCheck, Sparkles
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

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

const notifications = [
  { icon: Bell, title: "Society fund voting ends tomorrow", time: "2h ago", tone: "text-primary" },
  { icon: CheckCircle2, title: "Maintenance proposal approved", time: "5h ago", tone: "text-accent" },
  { icon: FileText, title: "New infrastructure request submitted", time: "Yesterday", tone: "text-primary" },
  { icon: Users, title: "Residents meeting scheduled for Saturday", time: "Yesterday", tone: "text-primary" },
  { icon: BarChart3, title: "Budget report generated successfully", time: "2 days ago", tone: "text-accent" },
  { icon: ShieldCheck, title: "QR vote receipt generated for Flat B-204", time: "2 days ago", tone: "text-accent" },
];

const activity = [
  { who: "Admin", what: "created election Society Development Fund Allocation 2026", when: "3 days ago" },
  { who: "Moderator", what: "approved 24 new residents", when: "2 days ago" },
  { who: "Admin", what: "completed CSV voter import (390 residents)", when: "2 days ago" },
  { who: "Sandesh Kamble", what: "updated manifesto", when: "1 day ago" },
  { who: "System", what: "published live results dashboard", when: "12h ago" },
];

const allocation = [
  { label: "Security Upgrades", pct: 40, color: "bg-primary" },
  { label: "Infrastructure", pct: 35, color: "bg-accent" },
  { label: "Community Welfare", pct: 25, color: "bg-secondary-foreground/70" },
];

const DEMO_USER_ID = "7ebcdf88-10aa-4929-9fa6-00cc95c9213d";
const DEMO_EMAIL = "demo-admin@castvote.app";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  const isDemo = user?.email?.toLowerCase() === DEMO_EMAIL;

  useEffect(() => {
    if (!user) return;
    (async () => {
      let q = supabase.from("elections").select("*").order("created_at", { ascending: false });
      q = isDemo ? q.eq("created_by", DEMO_USER_ID) : q.neq("created_by", DEMO_USER_ID);
      const { data: el } = await q;
      setElections((el ?? []) as Election[]);
      const { data: v } = await supabase.from("votes").select("election_id").eq("voter_id", user.id);
      setVoted(new Set((v ?? []).map((r) => r.election_id)));
    })();
  }, [user, isDemo]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  const stats = [
    { label: "Total Residents", value: 450, icon: Users, tone: "text-primary" },
    { label: "Approved Voters", value: 390, icon: ShieldCheck, tone: "text-accent" },
    { label: "Votes Cast", value: 312, icon: VoteIcon, tone: "text-primary" },
    { label: "Participation Rate", value: "80%", icon: TrendingUp, tone: "text-accent" },
    { label: "Active Proposals", value: 6, icon: FileText, tone: "text-primary" },
    { label: "Pending Requests", value: 14, icon: Inbox, tone: "text-accent" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
        {isDemo && (
          <>
            {/* Org header */}
            <Card className="p-6 border-primary/20" style={{ background: "var(--gradient-civic)" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap text-primary-foreground">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs mb-3">
                    <Building2 className="h-3.5 w-3.5" /> Active organization
                  </div>
                  <h1 className="text-3xl font-bold mb-1">GreenView Cooperative Housing Society</h1>
                  <p className="text-sm text-primary-foreground/85 max-w-2xl">
                    A modern housing society using digital voting for society fund allocation and infrastructure planning.
                  </p>
                </div>
                <Badge className="bg-accent text-accent-foreground"><Sparkles className="h-3 w-3 mr-1" />Live election in progress</Badge>
              </div>
            </Card>

            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {stats.map((s) => (
                <Card key={s.label} className="p-4">
                  <div className="flex items-center gap-2 mb-2"><s.icon className={`h-4 w-4 ${s.tone}`} /><p className="text-xs text-muted-foreground">{s.label}</p></div>
                  <p className="text-2xl font-bold">{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Allocation + Notifications */}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Society fund allocation</h2>
                  <span className="text-xs text-muted-foreground">Proposed split for 2026</span>
                </div>
                <div className="space-y-4">
                  {allocation.map((a) => (
                    <div key={a.label}>
                      <div className="flex justify-between text-sm mb-1"><span>{a.label}</span><span className="font-semibold">{a.pct}%</span></div>
                      <Progress value={a.pct} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Infrastructure spend</p><p className="font-semibold">₹ 8.4 L</p></div>
                  <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Welfare spend</p><p className="font-semibold">₹ 6.0 L</p></div>
                  <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Security spend</p><p className="font-semibold">₹ 9.6 L</p></div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-accent" />Notifications</h2>
                <ul className="space-y-3">
                  {notifications.map((n, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <n.icon className={`h-4 w-4 mt-0.5 ${n.tone}`} />
                      <div className="flex-1">
                        <p className="leading-tight">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}

        {/* Elections list */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Your elections</h2>
          {elections.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No elections yet.</Card>
          ) : (
            <div className="grid gap-3">
              {elections.map((e) => {
                const hasVoted = voted.has(e.id);
                return (
                  <Card key={e.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold">{e.title}</h3>
                          <Badge className={statusColors[e.status]}>{e.status}</Badge>
                          {hasVoted && <Badge variant="outline">Voted</Badge>}
                        </div>
                        {e.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{e.description}</p>}
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

        {/* Activity log */}
        {isDemo && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Recent activity</h2>
            <ul className="divide-y">
              {activity.map((a, i) => (
                <li key={i} className="py-3 flex items-center justify-between text-sm">
                  <span><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></span>
                  <span className="text-xs text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
