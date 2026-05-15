import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface Position { id: string; title: string; description: string | null; display_order: number; }
interface Candidate { id: string; position_id: string; name: string; photo_url: string | null; bio: string | null; manifesto: string | null; }

const Ballot = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [election, setElection] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: e } = await supabase.from("elections").select("*").eq("id", id).maybeSingle();
      setElection(e);
      const { data: pos } = await supabase.from("positions").select("*").eq("election_id", id).order("display_order");
      setPositions((pos ?? []) as Position[]);
      const positionIds = (pos ?? []).map((p) => p.id);
      if (positionIds.length) {
        const { data: cand } = await supabase.from("candidates").select("*").in("position_id", positionIds);
        setCandidates((cand ?? []) as Candidate[]);
      }
      const { data: vl } = await supabase.from("voter_list").select("code_used").eq("election_id", id).maybeSingle();
      setAllowed(!!vl?.code_used);
      const { data: existing } = await supabase.from("votes").select("id").eq("election_id", id).eq("voter_id", user.id).limit(1);
      if (existing && existing.length > 0) setSubmitted(true);
    })();
  }, [user, id]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  if (allowed === false) {
    return <Layout><div className="container py-16 text-center"><Card className="p-8 max-w-md mx-auto">
      <p className="mb-4">You need to redeem your voting code first.</p>
      <Button asChild><Link to={`/election/${id}/code`}>Enter code</Link></Button>
    </Card></div></Layout>;
  }

  if (submitted) {
    return <Layout><div className="container py-16 text-center"><Card className="p-10 max-w-md mx-auto">
      <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Vote recorded</h2>
      <p className="text-muted-foreground mb-6">Thank you for participating.</p>
      <div className="flex gap-2 justify-center">
        <Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button>
        <Button asChild><Link to={`/election/${id}/results`}>See results</Link></Button>
      </div>
    </Card></div></Layout>;
  }

  const submit = async () => {
    if (positions.some((p) => !selections[p.id])) {
      toast.error("Please vote for every position");
      return;
    }
    setSubmitting(true);
    const rows = positions.map((p) => ({
      election_id: id!, position_id: p.id, candidate_id: selections[p.id], voter_id: user.id,
    }));
    const { error } = await supabase.from("votes").insert(rows);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-1">{election?.title}</h1>
        <p className="text-muted-foreground mb-8">Select one candidate per position, then submit your ballot.</p>

        <div className="space-y-8">
          {positions.map((pos) => (
            <Card key={pos.id} className="p-6">
              <h2 className="text-xl font-semibold mb-1">{pos.title}</h2>
              {pos.description && <p className="text-sm text-muted-foreground mb-4">{pos.description}</p>}
              <RadioGroup value={selections[pos.id] || ""} onValueChange={(v) => setSelections({ ...selections, [pos.id]: v })} className="space-y-3">
                {candidates.filter((c) => c.position_id === pos.id).map((c) => (
                  <Label key={c.id} htmlFor={c.id} className="flex gap-4 p-4 rounded-md border cursor-pointer hover:bg-accent/30 has-[:checked]:border-primary has-[:checked]:bg-accent/40">
                    <RadioGroupItem id={c.id} value={c.id} className="mt-1" />
                    <Avatar className="h-12 w-12">
                      {c.photo_url && <AvatarImage src={c.photo_url} />}
                      <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{c.name}</div>
                      {c.bio && <div className="text-sm text-muted-foreground">{c.bio}</div>}
                      {c.manifesto && <div className="text-sm mt-1">{c.manifesto}</div>}
                    </div>
                  </Label>
                ))}
                {candidates.filter((c) => c.position_id === pos.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No candidates for this position.</p>
                )}
              </RadioGroup>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit ballot"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Ballot;
