import { Link, useNavigate } from "react-router-dom";
import { LogOut, Shield, LayoutDashboard, Github, Mail, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import devLogo from "@/assets/developer-logo.png";
import castvoteLogo from "@/assets/castvote-logo.png.asset.json";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => typeof window !== "undefined" && (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <img src={castvoteLogo.url} alt="CastVote logo" className="h-9 w-9 rounded-md object-cover" />
            <span>CastVote</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
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

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-2 mt-8">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/about">About</Link>
                  </Button>
                  {user ? (
                    <>
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link to="/admin"><Shield className="h-4 w-4 mr-2" />Admin</Link>
                        </Button>
                      )}
                      <Button variant="ghost" className="justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
                        <LogOut className="h-4 w-4 mr-2" />Sign out
                      </Button>
                    </>
                  ) : (
                    <Button asChild><Link to="/auth">Sign in</Link></Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
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
