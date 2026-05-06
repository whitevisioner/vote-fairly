import { Link, useNavigate } from "react-router-dom";
import { Vote, LogOut, Shield, LayoutDashboard, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import devLogo from "@/assets/developer-logo.png";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-civic)" }}>
              <Vote className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>CastVote</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about">About</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-1.5" />Dashboard</Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin"><Shield className="h-4 w-4 mr-1.5" />Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-1.5" />Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" asChild><Link to="/auth">Sign in</Link></Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={devLogo} alt="SK developer logo" className="h-12 w-12 rounded-full object-contain ring-2 ring-primary/20" />
            <div className="text-sm">
              <p className="font-semibold">
                Designed & developed by{" "}
                <Link to="/about" className="text-primary hover:text-accent underline-offset-2 hover:underline">
                  Sandesh Sanjay Kamble
                </Link>
              </p>
              <p className="text-muted-foreground">Crafting secure web experiences.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary">About</Link>
            <a href="https://github.com/kamblesandesh01" target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-1">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="mailto:sandeshsanjaykamble52@gmail.com" className="hover:text-primary flex items-center gap-1">
              <Mail className="h-4 w-4" /> Contact
            </a>
          </div>
        </div>
        <div className="border-t py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CastVote — Secure voting for every community.
        </div>
      </footer>
    </div>
  );
};
