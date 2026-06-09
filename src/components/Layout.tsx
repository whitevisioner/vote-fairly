import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, Shield, LayoutDashboard, Github, Mail, Menu, BarChart3, Settings, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import devLogo from "@/assets/developer-logo.png";
import castvoteLogo from "@/assets/castvote-logo.png.asset.json";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; Icon: typeof LogOut; adminOnly?: boolean };

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navItems: NavItem[] = user
    ? [
        { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { to: "/dashboard", label: "Results", Icon: BarChart3 },
        ...(isAdmin ? [{ to: "/admin/overview", label: "Admin", Icon: Shield, adminOnly: true } as NavItem] : []),
        ...(isAdmin ? [{ to: "/admin/settings", label: "Settings", Icon: Settings, adminOnly: true } as NavItem] : []),
        { to: "/about", label: "About", Icon: Info },
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
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-7xl">
          <Link to="/" className="flex items-center gap-2 font-semibold min-w-0">
            <img src={castvoteLogo.url} alt="CastVote" className="h-8 w-8 rounded-lg object-cover shrink-0" />
            <span className="text-[15px] tracking-tight truncate">CastVote</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.filter((n, i, a) => a.findIndex(x => x.label === n.label) === i).map((item) => (
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
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="min-h-11 min-w-11">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0 flex flex-col">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex items-center justify-between px-5 h-14 border-b">
                  <div className="flex items-center gap-2">
                    <img src={castvoteLogo.url} alt="" className="h-7 w-7 rounded-md" />
                    <span className="font-semibold text-sm">CastVote</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu" className="min-h-11 min-w-11">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.to + item.label}>
                        <Link
                          to={item.to}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-11",
                            isActive(item.to)
                              ? "text-foreground bg-secondary"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                          )}
                        >
                          <item.Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </nav>
                <div className="border-t p-3">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start min-h-11" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />Sign out
                    </Button>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild className="w-full min-h-11"><Link to="/auth">Sign in</Link></Button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-background mt-8 md:mt-12">
        {/* Desktop footer */}
        <div className="hidden md:flex container mx-auto px-4 py-10 max-w-7xl flex-row items-center justify-between gap-6 text-left">
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

        {/* Mobile footer — compact */}
        <div className="md:hidden px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src={castvoteLogo.url} alt="" className="h-6 w-6 rounded-md shrink-0" />
            <span className="text-xs text-muted-foreground truncate">CastVote</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/about" className="hover:text-foreground" aria-label="About">About</Link>
            <a href="https://github.com/kamblesandesh01" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
            <a href="mailto:sandeshsanjaykamble52@gmail.com" aria-label="Contact" className="hover:text-foreground">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-border/60 py-3 md:py-4 text-center text-[11px] md:text-xs text-muted-foreground px-4">
          © {new Date().getFullYear()} CastVote — Secure Digital Voting.
        </div>
      </footer>
    </div>
  );
};
