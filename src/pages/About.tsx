import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import devLogo from "@/assets/developer-logo.png";
import { Github, Mail, Linkedin, Code2, Languages, Target, Sparkles } from "lucide-react";

const About = () => (
  <Layout>
    <section className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero */}
      <Card className="p-8 md:p-12 text-center mb-8 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-civic)" }} />
        <div className="relative">
          <img
            src={devLogo}
            alt="SK developer logo"
            className="h-32 w-32 mx-auto mb-6 rounded-full object-contain ring-4 ring-primary/20"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">About the Developer</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Hi, I'm <span className="font-semibold text-foreground">Sandesh Kamble</span> — a passionate
            Full Stack Developer and AI enthusiast pursuing a B.Sc. in Information Technology from
            Mumbai University, graduated with an <span className="font-semibold text-foreground">A+ grade</span> and
            a <span className="font-semibold text-foreground">CGPA of 9.01</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary">Mumbai University</Badge>
            <Badge variant="secondary">A+ · CGPA 9.01</Badge>
            <Badge style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
              Full-Stack & AI
            </Badge>
          </div>
        </div>
      </Card>

      {/* Bio */}
      <Card className="p-6 sm:p-8 mb-8 space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
        <p>
          I specialize in building modern web applications, scalable backend systems, and AI-powered
          solutions using technologies such as React, TypeScript, Node.js, Python, Java, MongoDB, and
          MySQL. My development journey combines strong problem-solving skills with a passion for
          creating impactful digital experiences.
        </p>
        <p>
          Through internships in <span className="text-foreground font-medium">AI/ML</span> and{" "}
          <span className="text-foreground font-medium">Java Development</span>, I've gained practical
          experience in chatbot development, software engineering, and real-world project implementation.
          I enjoy transforming ideas into innovative applications that are functional, user-friendly,
          and scalable.
        </p>
        <p>
          Notable projects include a Real-Time Collaboration Platform with video calling and live code
          editing, an AI Fashion Moodboard Studio, a Weather Analytics Application, and an AI-powered
          Intent-Based Chatbot — strengthening my expertise in full-stack development, API integration,
          real-time communication, and artificial intelligence.
        </p>
        <p>
          Beyond coding, I actively participate in technical workshops, AI bootcamps, and continuous
          learning initiatives. When I'm not coding, you'll find me exploring new technologies, working
          on personal projects, and expanding my knowledge of AI and modern computing systems.
        </p>
      </Card>

      {/* Tech Stack */}
      <Card className="p-8 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Tech Stack & Skills</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Frontend</h3>
            <div className="flex flex-wrap gap-2">
              {["HTML", "CSS", "JavaScript"].map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Backend & Programming</h3>
            <div className="flex flex-wrap gap-2">
              {["PHP", "Core Java", "Python", "Full-Stack"].map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {["Web Dev", "AI", "Coding", "Current Affairs"].map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Strengths */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Personal Strengths</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Quick learner, problem-solving mindset, adaptable, and hardworking.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Quick Learner", "Problem-Solver", "Adaptable", "Hardworking"].map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Languages Spoken</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Effective collaboration in diverse environments.
          </p>
          <div className="flex flex-wrap gap-2">
            {["English", "Hindi", "Marathi", "Telugu"].map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Goal */}
      <Card className="p-8 mb-8" style={{ background: "var(--gradient-civic)" }}>
        <div className="flex items-center gap-2 mb-3 text-primary-foreground">
          <Target className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Long-Term Goal</h2>
        </div>
        <p className="text-primary-foreground/90 leading-relaxed">
          To become a skilled full-stack developer and work on innovative projects that create a
          meaningful impact while continuously learning and adapting to new technologies.
        </p>
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Get in touch</h2>
        <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
          <a href="mailto:sandeshsanjaykamble52@gmail.com" className="hover:text-primary flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </a>
          <a href="https://github.com/kamblesandesh01" target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/sandesh-sanjay-kamble/" target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-2">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        </div>
      </Card>
    </section>
  </Layout>
);

export default About;
