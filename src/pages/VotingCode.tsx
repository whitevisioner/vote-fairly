import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, ShieldCheck, Lock, ArrowLeft, CheckCircle2, XCircle, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { VoteStepper } from "@/components/VoteStepper";

type Status = "idle" | "loading" | "success" | "error";

const VotingCode = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [election, setElection] = useState<{ title: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("elections").select("title").eq("id", id).maybeSingle().then(({ data }) => setElection(data));
  }, [id]);

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.rpc("redeem_voting_code", { _election_id: id!, _code: clean });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Invalid code");
      return;
    }
    setStatus("success");
    toast.success("Code accepted");
    setTimeout(() => navigate(`/election/${id}/vote`), 600);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:py-16 max-w-xl">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 min-h-11">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Back to dashboard</Link>
        </Button>

        <VoteStepper current="code" />

        <Card className="p-6 sm:p-10 shadow-sm">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors ${
            status === "success" ? "bg-success/10" : status === "error" ? "bg-destructive/10" : "bg-primary/10"
          }`}>
            {status === "success" ? <CheckCircle2 className="h-7 w-7 text-success" />
              : status === "error" ? <XCircle className="h-7 w-7 text-destructive" />
              : <KeyRound className="h-7 w-7 text-primary" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1.5 tracking-tight">Verify your identity</h1>
          {election && <p className="text-sm text-center text-muted-foreground mb-1 truncate">{election.title}</p>}
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter the one-time voting code sent to your email.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="code">Voting code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); if (status === "error") setStatus("idle"); }}
                placeholder="A1B2-C3D4"
                autoFocus
                disabled={status === "loading" || status === "success"}
                className="mt-1.5 font-mono tracking-[0.3em] text-center text-lg h-14"
                aria-invalid={status === "error"}
              />
              {status === "error" && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> {errorMsg}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={status === "loading" || status === "success" || !code.trim()}>
              {status === "loading" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>)
                : status === "success" ? (<><CheckCircle2 className="h-4 w-4 mr-2" />Verified — entering ballot</>)
                : "Unlock ballot"}
            </Button>
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Need help? Contact your election administrator.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
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
