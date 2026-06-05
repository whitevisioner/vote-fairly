import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Vote,
  Users,
  BarChart3,
  Settings,
  Shield,
  FileText,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import castvoteLogo from "@/assets/castvote-logo.png.asset.json";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const nav = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Elections", url: "/admin?tab=elections", icon: Vote },
  { title: "Voters", url: "/admin?tab=voters", icon: Users },
  { title: "Results", url: "/admin?tab=results", icon: BarChart3 },
];

const system = [
  { title: "Administrators", url: "/admin?tab=admins", icon: Shield },
  { title: "Audit log", url: "/admin?tab=audit", icon: FileText },
  { title: "Settings", url: "/admin?tab=settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname, search } = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const isActive = (url: string, exact?: boolean) => {
    const [path, query] = url.split("?");
    if (exact) return pathname === path && !search;
    if (query) return pathname === path && search.includes(query);
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <img src={castvoteLogo.url} alt="CastVote" className="h-7 w-7 rounded-md object-cover shrink-0" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">CastVote</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {system.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-2 py-1.5 text-xs">
            <p className="font-medium truncate">{user.email}</p>
            <p className="text-muted-foreground">Administrator</p>
          </div>
        )}
        <Button variant="ghost" size="sm" className="justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
