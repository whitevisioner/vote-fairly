import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Lock, User, ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";
import castvoteLogo from "@/assets/castvote-logo.png.asset.json";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  fullName: z.string().trim().max(100).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"auth" | "forgot">("auth");
  const [resetEmail, setResetEmail] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account.");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate("/dashboard");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().email().safeParse(resetEmail);
    if (!parsed.success) return toast.error("Enter a valid email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
    setMode("auth");
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      {/* LEFT — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 w-[42%] border-r border-border/60 bg-card overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-60" />
        <div className="absolute inset-0 grain opacity-40" />

        <Link to="/" className="relative z-10 flex items-center gap-2 font-semibold">
          <img src={castvoteLogo.url} alt="CastVote" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-lg tracking-tight">CastVote</span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.05] tracking-tight">
            Secure digital voting
            <br />
            for modern communities.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Run transparent elections, manage society funds, and collect verified votes with
            enterprise-grade security and a beautiful experience.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            End-to-end encrypted · Role-based access · Audit trail
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CastVote
        </div>
      </div>

      {/* RIGHT — auth */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          <Link to="/" className="lg:hidden mb-8 flex items-center justify-center gap-2 font-semibold">
            <img src={castvoteLogo.url} alt="CastVote" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg">CastVote</span>
          </Link>

          {mode === "forgot" ? (
            <>
              <button
                onClick={() => setMode("auth")}
                className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="text-2xl font-semibold tracking-tight mb-1">Reset your password</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-9 h-11"
                      required
                    />
                  </div>
                </div>
                <Button disabled={loading} className="w-full h-11">
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight mb-1">Welcome to CastVote</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in or create an account to continue.
              </p>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="you@company.com" value={email}
                          onChange={(e) => setEmail(e.target.value)} className="pl-9 h-11" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" onClick={() => setMode("forgot")}
                          className="text-xs text-muted-foreground hover:text-foreground">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10 h-11" required />
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button disabled={loading} className="w-full h-11">
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-name" placeholder="Your name" value={fullName}
                          onChange={(e) => setFullName(e.target.value)} className="pl-9 h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-email" type="email" placeholder="you@company.com" value={email}
                          onChange={(e) => setEmail(e.target.value)} className="pl-9 h-11" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10 h-11" required minLength={6} />
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button disabled={loading} className="w-full h-11">
                      {loading ? "Creating account..." : "Create account"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      You'll receive a verification email to confirm your address.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to CastVote's Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
