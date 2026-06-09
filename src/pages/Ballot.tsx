import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Download, ShieldCheck, ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { VoteStepper } from "@/components/VoteStepper";

interface Position { id: string; title: string; description: string | null; display_order: number; }
interface Candidate { id: string; position_id: string; name: string; photo_url: string | null; bio: string | null; manifesto: string | null; }

const Ballot = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [election, setElection] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [receipt, setReceipt] = useState<{ id: string; ts: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      const { data: existing } = await supabase.from("votes").select("id,created_at").eq("election_id", id).eq("voter_id", user.id).limit(1);
      if (existing && existing.length > 0) {
        setSubmitted(true);
        setReceipt({ id: existing[0].id.slice(0, 8).toUpperCase(), ts: existing[0].created_at });
      }
    })();
  }, [user, id]);

  const completed = useMemo(
    () => positions.filter((p) => selections[p.id]).length,
    [positions, selections],
  );
  const progress = positions.length ? (completed / positions.length) * 100 : 0;

  if (loading) return <Layout><div className="container py-16">Loading...</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  if (allowed === false) {
    return <Layout><div className="container py-16 text-center"><Card className="p-8 max-w-md mx-auto">
      <p className="mb-4">You need to redeem your voting code first.</p>
      <Button asChild><Link to={`/election/${id}/code`}>Enter code</Link></Button>
    </Card></div></Layout>;
  }

  if (submitted) {
    const receiptId = receipt?.id || `${id}-${user.id}`.slice(0, 8).toUpperCase();
    const receiptTs = receipt?.ts || new Date().toISOString();
    const verifyUrl = `${window.location.origin}/election/${id}/results?receipt=${receiptId}`;
    const downloadReceipt = () => {
      const text = `CastVote Receipt\n\nElection: ${election?.title}\nReceipt ID: ${receiptId}\nTimestamp: ${receiptTs}\nVerify: ${verifyUrl}`;
      const blob = new Blob([text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `castvote-receipt-${receiptId}.txt`;
      a.click();
    };
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 sm:py-16 max-w-2xl">
          <VoteStepper current="results" />
          <Card className="overflow-hidden shadow-sm">
            <div className="px-6 sm:px-10 pt-10 pb-8 text-center bg-gradient-to-b from-success/5 to-transparent border-b">
              <div className="relative mx-auto mb-5 h-20 w-20">
                <div className="absolute inset-0 rounded-full bg-success/15 animate-ping" />
                <div className="relative h-20 w-20 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-11 w-11 text-success" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">Vote recorded</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                Thank you for participating in <span className="font-medium text-foreground">{election?.title}</span>.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center mb-6">
                <div className="bg-background rounded-xl p-3 border mx-auto sm:mx-0">
                  <QRCodeSVG value={verifyUrl} size={130} />
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Receipt ID</p>
                    <p className="font-mono font-semibold text-base break-all">{receiptId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Election</p>
                    <p className="font-medium break-words">{election?.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Timestamp</p>
                    <p className="font-medium">{new Date(receiptTs).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 border p-4 mb-6">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-0.5">How to verify</p>
                    Scan the QR code or share the receipt ID with the election administrator. Receipts are tamper-evident and linked to the published results.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" onClick={downloadReceipt} className="min-h-11">
                  <Download className="h-4 w-4 mr-1.5" />Receipt
                </Button>
                <Button asChild variant="outline" className="min-h-11"><Link to="/dashboard">Dashboard</Link></Button>
                <Button asChild className="min-h-11"><Link to={`/election/${id}/results`}>View results</Link></Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    const rows = positions.map((p) => ({
      election_id: id!, position_id: p.id, candidate_id: selections[p.id], voter_id: user.id,
    }));
    const { data: inserted, error } = await supabase.from("votes").insert(rows).select("id,created_at");
    setSubmitting(false);
    setConfirmOpen(false);
    if (error) { toast.error(error.message); return; }
    if (inserted && inserted.length) {
      setReceipt({ id: inserted[0].id.slice(0, 8).toUpperCase(), ts: inserted[0].created_at });
    }
    setSubmitted(true);
  };

  const tryReview = () => {
    if (positions.some((p) => !selections[p.id])) {
      toast.error("Please vote for every position");
      const firstMissing = positions.find((p) => !selections[p.id]);
      if (firstMissing) {
        document.getElementById(`pos-${firstMissing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>

        <VoteStepper current="ballot" />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{election?.title}</h1>
          <p className="text-muted-foreground text-sm">Select one candidate per position, then review and submit.</p>
        </div>

        {/* Sticky progress */}
        <div className="sticky top-14 sm:top-16 z-20 -mx-4 px-4 py-3 bg-background/85 backdrop-blur-md border-b mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
            <span className="font-medium truncate">
              Position {Math.min(completed + 1, positions.length || 1)} of {positions.length}
            </span>
            <span className="text-muted-foreground tabular-nums shrink-0">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4 sm:space-y-5">
          {positions.map((pos, idx) => {
            const done = !!selections[pos.id];
            const posCandidates = candidates.filter((c) => c.position_id === pos.id);
            return (
              <Card id={`pos-${pos.id}`} key={pos.id} className="p-4 sm:p-6 scroll-mt-32">
                <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                      <h2 className="text-lg sm:text-xl font-semibold break-words">{pos.title}</h2>
                    </div>
                    {pos.description && <p className="text-sm text-muted-foreground break-words">{pos.description}</p>}
                  </div>
                  {done ? (
                    <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Selected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground shrink-0">Pending</Badge>
                  )}
                </div>

                <RadioGroup
                  value={selections[pos.id] || ""}
                  onValueChange={(v) => setSelections({ ...selections, [pos.id]: v })}
                  className="grid sm:grid-cols-2 gap-3 mt-4"
                >
                  {posCandidates.map((c) => {
                    const selected = selections[pos.id] === c.id;
                    return (
                      <Label
                        key={c.id}
                        htmlFor={c.id}
                        className={cn(
                          "relative flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[88px]",
                          "hover:border-primary/50 hover:bg-accent/30",
                          selected ? "border-primary bg-primary/5 shadow-sm" : "border-border",
                        )}
                      >
                        <RadioGroupItem id={c.id} value={c.id} className="mt-1 shrink-0" />
                        <Avatar className="h-12 w-12 shrink-0">
                          {c.photo_url && <AvatarImage src={c.photo_url} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {c.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold break-words">{c.name}</span>
                            {selected && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5">
                                <CheckCircle2 className="h-3 w-3 mr-0.5" />Selected
                              </Badge>
                            )}
                          </div>
                          {c.bio && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.bio}</div>}
                          {c.manifesto && <div className="text-xs mt-1 line-clamp-2 text-muted-foreground">{c.manifesto}</div>}
                        </div>
                      </Label>
                    );
                  })}
                  {posCandidates.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full">No candidates for this position.</p>
                  )}
                </RadioGroup>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-muted/30">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <span>Your selections are cryptographically tied to your account. You will receive a verifiable receipt.</span>
          </div>
          <Button size="lg" onClick={tryReview} disabled={submitting} className="w-full sm:w-auto min-h-12 sm:ml-auto">
            Review & submit <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
          </Button>
        </Card>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl sm:text-2xl">Confirm your vote</AlertDialogTitle>
              <AlertDialogDescription>
                Please review your selections below before submitting.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 max-h-72 overflow-y-auto -mx-1 px-1">
              {positions.map((p) => {
                const c = candidates.find((x) => x.id === selections[p.id]);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 text-sm rounded-lg border p-3 bg-muted/30">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Position</p>
                      <p className="font-medium truncate">{p.title}</p>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Selected</p>
                      <p className="font-semibold truncate">{c?.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Votes cannot be changed after submission.</span>
            </div>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="min-h-11 mt-0">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={submit} disabled={submitting} className="min-h-11 bg-primary hover:bg-primary/90 text-base font-semibold">
                {submitting ? "Submitting..." : "Submit vote"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Ballot;
