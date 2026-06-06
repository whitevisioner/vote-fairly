import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import AdminElections from "./pages/AdminElections.tsx";
import AdminElectionDetail from "./pages/AdminElectionDetail.tsx";
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
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminElections /></ProtectedRoute>} />
            <Route path="/admin/election/:id" element={<ProtectedRoute requireAdmin><AdminElectionDetail /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
