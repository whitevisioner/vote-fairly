import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-60" />
        <div className="container mx-auto max-w-2xl px-4 py-24 sm:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-8">
            <Search className="h-3 w-3" />
            Page not found
          </div>
          <h1 className="text-7xl sm:text-9xl font-semibold tracking-tight text-gradient mb-4">
            404
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-2">
            We couldn't find what you were looking for.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-8 font-mono">
            {location.pathname}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-11 px-6">
              <Link to="/"><Home className="h-4 w-4 mr-1.5" />Back to home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6">
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
