import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary-light to-earth">
      <div className="text-center px-4 animate-fade-in">
        <h1 className="mb-4 text-9xl font-bold text-secondary">404</h1>
        <h2 className="mb-4 text-3xl font-bold text-primary-foreground">Adventure Not Found</h2>
        <p className="mb-8 text-lg text-primary-foreground/80 max-w-md mx-auto">
          The path you're seeking doesn't exist. Let's get you back on track to discover Ethiopia's wonders.
        </p>
        <Button asChild variant="hero" size="lg">
          <Link to="/">
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
