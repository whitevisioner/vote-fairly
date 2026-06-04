import { Link } from "react-router-dom";
import {
  ShieldCheck, BarChart3, Users, Lock, KeyRound, Vote, ArrowRight, Sparkles,
  CheckCircle2, Clock, FileText, Building2, Star, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

const stats = [
  { value: "450+", label: "Residents" },
  { value: "312+", label: "Votes cast" },
  { value: "80%", label: "Participation" },
  { value: "99.9%", label: "Reliability" },
];

const features = [
  { Icon: Lock, title: "Secure voting", desc: "End-to-end protection with email verification and approved voter lists." },
  { Icon: KeyRound, title: "One-time codes", desc: "Each voter receives a unique code that unlocks their ballot once." },
  { Icon: BarChart3, title: "Real-time results", desc: "Live tallies, parliament charts, and audit-ready breakdowns." },
  { Icon: FileText, title: "Audit logs", desc: "Every admin action and ballot is timestamped and traceable." },
  { Icon: Clock, title: "Election scheduling", desc: "Draft, schedule, open, and close elections on your timeline." },
  { Icon: ShieldCheck, title: "Role-based access", desc: "Admin, voter, and observer roles enforced at the database layer." },
  { Icon: Users, title: "Candidate management", desc: "Photos, manifestos, and rich candidate profiles." },
  { Icon: Building2, title: "Society fund voting", desc: "Allocate budgets and infrastructure spend transparently." },
];

const testimonials = [
  { quote: "CastVote transformed how our 450-resident society makes decisions. Voting is now anonymous, instant, and verifiable.", who: "Priya Sharma", role: "Society President" },
  { quote: "We replaced paper ballots overnight. The audit trail alone makes it indispensable.", who: "Rohan Mehta", role: "Committee Member" },
  { quote: "Beautiful product. Felt like Linear or Vercel for governance.", who: "Anjali Rao", role: "Tech Lead" },
];

const faqs = [
  { q: "How are votes kept anonymous?", a: "Ballots are decoupled from voter identity at submission time. Admins see participation, not individual choices." },
  { q: "Can I import a voter list?", a: "Yes — bulk CSV import with preview, code generation, and per-voter status tracking." },
  { q: "Do voters need an account?", a: "Voters create an account with email and password, then redeem a one-time code to access their ballot." },
  { q: "Is CastVote suitable for housing societies?", a: "Absolutely — it's built specifically for societies, clubs, committees, and associations." },
];

const Index = () => (
  <Layout>
    {/* HERO */}
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 grain opacity-30" />
      <div className="container mx-auto max-w-6xl px-4 pt-20 sm:pt-28 pb-16 sm:pb-24 relative">
        <div className="flex justify-center mb-6 animate-fade-in">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="h-3 w-3 text-accent" />
            New: Parliament visualization & PDF receipts
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <h1 className="text-center text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-slide-up">
          Secure digital voting
          <br />
          <span className="text-gradient">for modern communities.</span>
        </h1>
        <p className="mx-auto max-w-2xl mt-6 text-center text-base sm:text-lg text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: "80ms" }}>
          Run transparent elections, manage society funds, and collect verified votes with complete confidence.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: "160ms" }}>
          <Button size="lg" asChild className="h-11 px-6">
            <Link to="/auth">Start voting <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-11 px-6">
            <Link to="/dashboard">Explore platform</Link>
          </Button>
        </div>

        {/* Dashboard preview */}
        <div className="relative mt-16 sm:mt-20 mx-auto max-w-5xl animate-slide-up" style={{ animationDelay: "240ms" }}>
          <div className="absolute -inset-x-8 -top-6 -bottom-6 bg-gradient-to-tr from-accent/20 via-transparent to-accent/10 blur-3xl rounded-[2rem]" />
          <Card className="relative overflow-hidden border-border/80 shadow-2xl">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60 bg-secondary/50">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="ml-3 text-xs text-muted-foreground">castvote.app/dashboard</div>
            </div>
            <div className="p-6 sm:p-8 grid sm:grid-cols-4 gap-4 bg-background">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border/60 p-4 bg-card">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
                </div>
              ))}
              <div className="sm:col-span-4 mt-2 rounded-lg border border-border/60 p-5 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium">Live election · Society Fund Allocation 2026</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">LIVE</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Infrastructure", pct: 42, color: "bg-accent" },
                    { label: "Security", pct: 33, color: "bg-foreground" },
                    { label: "Welfare", pct: 25, color: "bg-muted-foreground" },
                  ].map((b) => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{b.label}</span>
                        <span className="font-medium">{b.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>

    {/* STATS */}
    <section className="border-b border-border/60">
      <div className="container mx-auto max-w-6xl px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* FEATURES */}
    <section className="container mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent mb-3">Built for transparency</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Everything you need to run trustworthy elections.
        </h2>
        <p className="text-muted-foreground mt-3 text-base">
          A complete platform — from candidate setup to live results — engineered with security at the core.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        {features.map((f) => (
          <Card key={f.title} className="p-5 hover:border-foreground/20 transition-colors group">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
              <f.Icon className="h-4 w-4 text-foreground" />
            </div>
            <h3 className="font-semibold mb-1.5 text-[15px]">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>

    {/* SECURITY STRIP */}
    <section className="border-y border-border/60 bg-secondary/30">
      <div className="container mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <ShieldCheck className="h-8 w-8 text-accent mb-3" />
          <h3 className="text-xl font-semibold mb-2">Security at the core</h3>
          <p className="text-sm text-muted-foreground">
            Row-level security, role-based access control, end-to-end encrypted sessions, and full audit logging.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:col-span-2">
          {[
            "Row-level security on every table",
            "Role-based admin & voter separation",
            "One-time voting codes per voter",
            "Cryptographic vote receipts (QR + PDF)",
            "Immutable audit log of admin actions",
          ].map((line) => (
            <div key={line} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              {line}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* TESTIMONIALS */}
    <section className="container mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm font-medium text-accent mb-3">Trusted by communities</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Loved by societies & committees</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <Card key={t.who} className="p-6">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
            </div>
            <p className="text-sm leading-relaxed mb-5">"{t.quote}"</p>
            <div className="text-xs">
              <p className="font-medium">{t.who}</p>
              <p className="text-muted-foreground">{t.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>

    {/* FAQ */}
    <section className="border-t border-border/60">
      <div className="container mx-auto max-w-3xl px-4 py-20 sm:py-28">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mb-12">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-border/60">
      <div className="container mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Ready to run your next election?</h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Join communities running secure, transparent elections in minutes — not weeks.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild className="h-11 px-6">
            <Link to="/auth">Get started free <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-11 px-6">
            <Link to="/about">Meet the maker</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default Index;
