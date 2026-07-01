import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}

export const AdminLayout = ({ children, title, breadcrumb, actions }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 backdrop-blur-xl px-3 sm:px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <nav className="flex items-center gap-1.5 text-sm min-w-0">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">CastVote</Link>
              <span className="text-muted-foreground">/</span>
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
              {breadcrumb?.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  <span className="text-muted-foreground">/</span>
                  {b.to ? (
                    <Link to={b.to} className="text-muted-foreground hover:text-foreground transition-colors truncate">{b.label}</Link>
                  ) : (
                    <span className="font-medium truncate">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1">
            {(title || actions) && (
              <div className="border-b border-border/60 bg-background">
                <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 max-w-7xl mx-auto w-full">
                  <div className="min-w-0">
                    {title && <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">{title}</h1>}
                  </div>
                  {actions && <div className="flex items-center gap-2 w-full sm:w-auto min-w-0 [&>*]:w-full sm:[&>*]:w-auto">{actions}</div>}
                </div>
              </div>
            )}
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
