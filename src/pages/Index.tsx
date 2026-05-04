import { Link } from "react-router-dom";
import { Vote, ShieldCheck, BarChart3, Users, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/Layout";

const Index = () => (
  <Layout>
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-civic)" }} />
      <div className="container mx-auto px-4 py-24 text-center relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground mb-6">
          <ShieldCheck className="h-4 w-4" /> Triple-verified ballots
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Run elections you can <span className="text-primary">trust</span>.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A secure voting platform for student bodies, companies, and communities — with email verification,
          approved voter lists, one-time codes, and live results.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg" asChild><Link to="/auth">Get started</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/dashboard">View elections</Link></Button>
        </div>
      </div>
    </section>

    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Built for transparent elections</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Lock, title: "Email OTP verification", desc: "Every voter confirms their email before they get near a ballot." },
          { icon: Users, title: "Approved voter lists", desc: "Admins control exactly who is eligible to vote in each election." },
          { icon: KeyRound, title: "One-time voting codes", desc: "Each voter receives a unique code that unlocks their ballot once." },
          { icon: Vote, title: "Multi-position ballots", desc: "Vote for President, Secretary, and more in a single election." },
          { icon: BarChart3, title: "Live results", desc: "Real-time tallies update as ballots are cast." },
          { icon: ShieldCheck, title: "Auditable trail", desc: "Every vote is recorded and verifiable by administrators." },
        ].map((f, i) => (
          <Card key={i} className="p-6">
            <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  </Layout>
);

export default Index;
