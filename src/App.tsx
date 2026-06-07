import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import VotingCode from "./pages/VotingCode.tsx";
import Ballot from "./pages/Ballot.tsx";
import Results from "./pages/Results.tsx";
import AdminElectionDetail from "./pages/AdminElectionDetail.tsx";
import AdminOverview from "./pages/admin/Overview.tsx";
import AdminElections from "./pages/admin/Elections.tsx";
import AdminVoters from "./pages/admin/Voters.tsx";
import AdminResults from "./pages/admin/Results.tsx";
import AdminAdministrators from "./pages/admin/Administrators.tsx";
import AdminAudit from "./pages/admin/Audit.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/election/:id/code" element={<ProtectedRoute><VotingCode /></ProtectedRoute>} />
            <Route path="/election/:id/vote" element={<ProtectedRoute><Ballot /></ProtectedRoute>} />
            <Route path="/election/:id/results" element={<Results />} />

            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/admin/overview" element={<ProtectedRoute requireAdmin><AdminOverview /></ProtectedRoute>} />
            <Route path="/admin/elections" element={<ProtectedRoute requireAdmin><AdminElections /></ProtectedRoute>} />
            <Route path="/admin/voters" element={<ProtectedRoute requireAdmin><AdminVoters /></ProtectedRoute>} />
            <Route path="/admin/results" element={<ProtectedRoute requireAdmin><AdminResults /></ProtectedRoute>} />
            <Route path="/admin/administrators" element={<ProtectedRoute requireAdmin><AdminAdministrators /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute requireAdmin><AdminAudit /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/election/:id" element={<ProtectedRoute requireAdmin><AdminElectionDetail /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
