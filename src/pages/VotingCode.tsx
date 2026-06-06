import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { VoteStepper } from "@/components/VoteStepper";

const VotingCode = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [election, setElection] = useState<{ title: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("elections").select("title").eq("id", id).maybeSingle().then(({ data }) => setElection(data));
  }, [id]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.rpc("redeem_voting_code", { _election_id: id!, _code: code.trim() });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Code accepted");
    navigate(`/election/${id}/vote`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-xl">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Back to dashboard</Link>
        </Button>

        <VoteStepper current="code" />

        <Card className="p-6 sm:p-8 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">Verify your identity</h1>
          {election && <p className="text-sm text-center text-muted-foreground mb-1">{election.title}</p>}
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter the one-time voting code sent to your email.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="code">Voting code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="A1B2-C3D4"
                autoFocus
                className="mt-1.5 font-mono tracking-widest text-center text-lg h-12"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={submitting || !code.trim()}>
              {submitting ? "Verifying..." : "Unlock ballot"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>End-to-end audit trail with signed receipts.</span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Single-use code, never reusable after redemption.</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default VotingCode;
