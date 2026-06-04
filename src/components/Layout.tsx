import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Shield, LayoutDashboard, Github, Mail, Menu, BarChart3, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import devLogo from "@/assets/developer-logo.png";
import castvoteLogo from "@/assets/castvote-logo.png.asset.json";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; Icon?: typeof LogOut; adminOnly?: boolean };

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems: NavItem[] = user
    ? [
        { to: "/about", label: "About", Icon: Info },
        { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
        ...(isAdmin ? [{ to: "/admin", label: "Admin", Icon: Shield, adminOnly: true }] : []),
        ...(isAdmin ? [{ to: "/admin?tab=settings", label: "Settings", Icon: Settings, adminOnly: true }] : []),
      ]
    : [{ to: "/about", label: "About", Icon: Info }];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (to: string) => {
    const path = to.split("?")[0];
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-7xl">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src={castvoteLogo.url} alt="CastVote" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-[15px] tracking-tight">CastVote</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive(item.to)
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/dashboard"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive("/results") ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                Results
              </Link>
            )}
            <div className="mx-1 h-5 w-px bg-border" />
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1.5" />Sign out
              </Button>
            ) : (
              <Button size="sm" asChild className="ml-1">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </nav>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-1 mt-8">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.to + item.label}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                          isActive(item.to)
                            ? "text-foreground bg-secondary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                        )}
                      >
                        {item.Icon && <item.Icon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {user ? (
                    <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />Sign out
                    </Button>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild><Link to="/auth">Sign in</Link></Button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-background mt-12">
        <div className="container mx-auto px-4 py-10 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={devLogo} alt="Sandesh Kamble" className="h-10 w-10 rounded-full object-contain ring-1 ring-border" />
            <div className="text-sm">
              <p className="font-medium">
                Built by{" "}
                <Link to="/about" className="hover:text-accent underline-offset-2 hover:underline">
                  Sandesh Sanjay Kamble
                </Link>
              </p>
              <p className="text-muted-foreground text-xs">Secure digital voting for modern communities.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <a href="https://github.com/kamblesandesh01" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="mailto:sandeshsanjaykamble52@gmail.com" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Mail className="h-4 w-4" /> Contact
            </a>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CastVote — Secure Digital Voting for Modern Communities.
        </div>
      </footer>
    </div>
  );
};
