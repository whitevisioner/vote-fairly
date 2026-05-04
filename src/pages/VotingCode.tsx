import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

const VotingCode = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-8">
          <div className="h-12 w-12 rounded-md bg-accent flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">Enter your voting code</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Use the one-time code provided by your election administrator.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Voting code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. A1B2-C3D4" autoFocus />
            </div>
            <Button className="w-full" disabled={submitting}>{submitting ? "Verifying..." : "Unlock ballot"}</Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default VotingCode;
