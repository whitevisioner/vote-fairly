import { Link, useNavigate } from "react-router-dom";
import { Vote, LogOut, Shield, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

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
            <span>BallotBox</span>
          </Link>
          <nav className="flex items-center gap-2">
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
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        BallotBox — Secure voting for every community.
      </footer>
    </div>
  );
};
