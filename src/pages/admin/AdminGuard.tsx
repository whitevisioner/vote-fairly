import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading)
    return (
      <AdminLayout title="Admin">
        <div className="text-muted-foreground">Loading…</div>
      </AdminLayout>
    );
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin)
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h2 className="font-semibold mb-1">Admins only</h2>
          <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </Card>
      </AdminLayout>
    );
  return <>{children}</>;
};
