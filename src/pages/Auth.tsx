import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Sparkles } from "lucide-react";

const DEMO_EMAIL = "demo-admin@castvote.app";
const DEMO_PASSWORD = "DemoAdmin#2026";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().max(100).optional(),
});

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

  const handleDemoLogin = async () => {
    setLoading(true);
    let { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    if (error) {
      // Account doesn't exist yet — create it (auto-confirm is on)
      const { error: signUpErr } = await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: { data: { full_name: "Demo Admin" } },
      });
      if (signUpErr) { setLoading(false); toast.error(signUpErr.message); return; }
      const retry = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      error = retry.error;
    }
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Logged in as Demo Admin");
    navigate("/admin");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-6 mb-4 border-accent/40" style={{ background: "hsl(var(--accent) / 0.08)" }}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--gradient-civic)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Quick Demo Login</h2>
              <p className="text-xs text-muted-foreground mb-3">
                Instantly explore CastVote as a pre-seeded Admin — no typing required.
              </p>
              <Button onClick={handleDemoLogin} disabled={loading} className="w-full" style={{ background: "var(--gradient-civic)" }}>
                {loading ? "Loading..." : "Enter Demo Mode (Admin)"}
              </Button>
              <p className="text-[11px] text-muted-foreground mt-2">
                Email: <code>{DEMO_EMAIL}</code> · Password: <code>{DEMO_PASSWORD}</code>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-1 text-center">Voter Access</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Sign in or create your voting account</p>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
                <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
                <p className="text-xs text-muted-foreground text-center">You'll receive a verification email.</p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
