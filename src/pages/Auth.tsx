import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Lock, User, ShieldCheck, Vote, Users, TrendingUp, Activity, Sparkles, KeyRound, Copy } from "lucide-react";

const CREDENTIALS = [
  { label: "Admin", email: "admin@castvote.com", password: "AdminPassword#2026", accent: "from-[#7C4DFF] to-[#5E35B1]" },
  { label: "Demo Admin", email: "demo-admin@castvote.app", password: "DemoAdmin#2026", accent: "from-[#00E676] to-[#00C853]" },
];

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().max(100).optional(),
});

const StatCard = ({ icon: Icon, value, label, accent, delay }: any) => (
  <div
    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] animate-fade-in hover:bg-white/10 transition-all"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
  >
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="leading-tight">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
    </div>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Check your email to confirm your account.");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1117] text-white overflow-hidden">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT: Branding */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-gradient-to-br from-[#0F1117] via-[#151A24] to-[#1A1D29]">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          {/* Animated blobs */}
          <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#7C4DFF] opacity-30 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute bottom-0 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#00E676] opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[#00BFFF] opacity-10 blur-3xl" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 animate-fade-in">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00E676] to-[#00C853] shadow-[0_8px_30px_rgba(0,230,118,0.4)]">
              <Vote className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">CastVote</div>
              <div className="text-xs text-white/50">Digital Voting Platform</div>
            </div>
          </div>

          {/* Headline */}
          <div className="relative z-10 space-y-6 animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "backwards" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs backdrop-blur-xl">
              <Sparkles className="h-3 w-3 text-[#00E676]" />
              <span className="text-white/80">Trusted by 200+ communities</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Secure Digital Voting for{" "}
              <span className="bg-gradient-to-r from-[#00E676] via-[#7C4DFF] to-[#00BFFF] bg-clip-text text-transparent">
                Smart Communities
              </span>
            </h1>
            <p className="text-base text-white/60 max-w-md leading-relaxed">
              Modern society fund management and digital voting platform — transparent, anonymous, and built for the next generation.
            </p>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 max-w-md pt-4">
              <StatCard icon={Users} value="450" label="Residents" accent="bg-gradient-to-br from-[#7C4DFF] to-[#5E35B1]" delay={300} />
              <StatCard icon={Vote} value="312" label="Votes Cast" accent="bg-gradient-to-br from-[#00E676] to-[#00C853]" delay={400} />
              <StatCard icon={TrendingUp} value="80%" label="Participation" accent="bg-gradient-to-br from-[#00BFFF] to-[#1E88E5]" delay={500} />
              <StatCard icon={Activity} value="Live" label="Voting Active" accent="bg-gradient-to-br from-[#FF4081] to-[#C2185B]" delay={600} />
            </div>
          </div>

          {/* Footer testimonial */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl max-w-md animate-fade-in" style={{ animationDelay: "700ms", animationFillMode: "backwards" }}>
            <div className="flex items-center gap-2 text-[#00E676] mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">End-to-end encrypted</span>
            </div>
            <p className="text-sm text-white/70 italic">
              "CastVote transformed how our 450-resident community handles decisions. Voting is now anonymous, instant, and verifiable."
            </p>
            <div className="mt-3 text-xs text-white/50">— Priya Sharma, Society President</div>
          </div>
        </div>

        {/* RIGHT: Auth form */}
        <div className="relative flex items-center justify-center p-6 sm:p-10 bg-[#0F1117] lg:bg-gradient-to-br lg:from-[#151A24] lg:to-[#0F1117]">
          {/* Mobile glow */}
          <div className="lg:hidden pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7C4DFF] opacity-20 blur-3xl" />
          <div className="lg:hidden pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#00E676] opacity-20 blur-3xl" />

          <div className="relative w-full max-w-md animate-fade-in">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00E676] to-[#00C853] shadow-[0_8px_30px_rgba(0,230,118,0.4)]">
                <Vote className="h-6 w-6 text-black" />
              </div>
              <div className="text-xl font-bold">CastVote</div>
            </div>

            {/* Glow behind card */}
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#00E676]/20 via-[#7C4DFF]/10 to-[#00BFFF]/20 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Welcome Back to CastVote</h2>
                <p className="mt-2 text-sm text-white/60">Secure digital voting for modern communities.</p>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-full bg-white/5 p-1 h-11 border border-white/10">
                  <TabsTrigger
                    value="signin"
                    className="rounded-full text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E676] data-[state=active]:to-[#00C853] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all"
                  >
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-full text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E676] data-[state=active]:to-[#00C853] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all"
                  >
                    Sign up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <FieldIcon icon={Mail}>
                      <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#00E676]/40 focus-visible:border-[#00E676]/50 rounded-xl transition-all" />
                    </FieldIcon>
                    <FieldIcon icon={Lock}>
                      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#00E676]/40 focus-visible:border-[#00E676]/50 rounded-xl transition-all" />
                    </FieldIcon>
                    <Button disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-semibold shadow-[0_8px_30px_rgba(0,230,118,0.35)] hover:shadow-[0_12px_40px_rgba(0,230,118,0.5)] hover:scale-[1.02] active:scale-[0.99] transition-all">
                      {loading ? "Signing in..." : "Sign in to CastVote"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <FieldIcon icon={User}>
                      <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#00E676]/40 focus-visible:border-[#00E676]/50 rounded-xl transition-all" />
                    </FieldIcon>
                    <FieldIcon icon={Mail}>
                      <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#00E676]/40 focus-visible:border-[#00E676]/50 rounded-xl transition-all" />
                    </FieldIcon>
                    <FieldIcon icon={Lock}>
                      <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                        className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#00E676]/40 focus-visible:border-[#00E676]/50 rounded-xl transition-all" />
                    </FieldIcon>
                    <Button disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-semibold shadow-[0_8px_30px_rgba(0,230,118,0.35)] hover:shadow-[0_12px_40px_rgba(0,230,118,0.5)] hover:scale-[1.02] active:scale-[0.99] transition-all">
                      {loading ? "Creating account..." : "Create your account"}
                    </Button>
                    <p className="text-[11px] text-white/40 text-center">You'll receive a verification email to confirm your address.</p>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00E676]" />
                Protected by end-to-end encryption
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              By continuing, you agree to CastVote's Terms of Service & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldIcon = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
    {children}
  </div>
);

export default Auth;
