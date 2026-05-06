import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import devLogo from "@/assets/developer-logo.png";
import { Github, Mail, Globe } from "lucide-react";

const About = () => (
  <Layout>
    <section className="container mx-auto px-4 py-16 max-w-3xl">
      <Card className="p-8 text-center">
        <img
          src={devLogo}
          alt="SK developer logo"
          className="h-32 w-32 mx-auto mb-6 rounded-full object-contain"
        />
        <h1 className="text-4xl font-bold mb-2">About the Developer</h1>
        <p className="text-muted-foreground mb-6">
          Hi, I'm <span className="font-semibold text-foreground">SK</span> — the
          developer behind BallotBox. I build secure, modern web platforms with a
          focus on trust, transparency, and clean user experience.
        </p>
        <p className="text-muted-foreground mb-8">
          BallotBox was crafted to make running elections — for clubs, companies,
          or whole communities — simple and verifiable from start to finish.
        </p>
        <div className="flex justify-center gap-6 text-muted-foreground">
          <a href="mailto:hello@example.com" className="hover:text-primary flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a href="#" className="hover:text-primary flex items-center gap-2">
            <Globe className="h-4 w-4" /> Website
          </a>
        </div>
      </Card>
    </section>
  </Layout>
);

export default About;
