import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mountain, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isHomePage || isMobile) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, isMobile]);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClassName = (path: string) => {
    const baseClasses = "transition-colors font-medium";
    const activeClasses = isActive(path)
      ? "text-primary font-semibold"
      : "text-foreground hover:text-primary";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHomePage || isMobile
        ? 'bg-background/98 backdrop-blur-md border-b border-primary/20 shadow-lg shadow-primary/5' 
        : 'bg-transparent backdrop-blur-none border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2.5 font-display text-2xl md:text-3xl font-bold transition-all duration-300 group ${
            isScrolled || !isHomePage || isMobile
              ? 'text-primary hover:text-primary-light' 
              : 'text-primary-foreground hover:text-secondary'
          }`}>
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
              isScrolled || !isHomePage || isMobile
                ? 'bg-primary/10 group-hover:bg-primary/20' 
                : 'bg-primary-foreground/10 group-hover:bg-secondary/20'
            }`}>
              <Mountain className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Hulet Fish
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`transition-colors font-medium ${
                isActive("/") 
                  ? (isScrolled || !isHomePage || isMobile) 
                    ? "text-primary font-semibold" 
                    : "text-secondary font-semibold"
                  : (isScrolled || !isHomePage || isMobile) 
                    ? "text-foreground hover:text-primary" 
                    : "text-primary-foreground hover:text-secondary"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/tours" 
              className={`transition-colors font-medium ${
                isActive("/tours") 
                  ? (isScrolled || !isHomePage || isMobile) 
                    ? "text-primary font-semibold" 
                    : "text-secondary font-semibold"
                  : (isScrolled || !isHomePage || isMobile) 
                    ? "text-foreground hover:text-primary" 
                    : "text-primary-foreground hover:text-secondary"
              }`}
            >
              Experiences
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors font-medium ${
                isActive("/about") 
                  ? (isScrolled || !isHomePage || isMobile) 
                    ? "text-primary font-semibold" 
                    : "text-secondary font-semibold"
                  : (isScrolled || !isHomePage || isMobile) 
                    ? "text-foreground hover:text-primary" 
                    : "text-primary-foreground hover:text-secondary"
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors font-medium ${
                isActive("/contact") 
                  ? (isScrolled || !isHomePage || isMobile) 
                    ? "text-primary font-semibold" 
                    : "text-secondary font-semibold"
                  : (isScrolled || !isHomePage || isMobile) 
                    ? "text-foreground hover:text-primary" 
                    : "text-primary-foreground hover:text-secondary"
              }`}
            >
              Contact
            </Link>
            <div className="flex items-center gap-3 ml-4">
              {isAuthenticated ? (
                <Button asChild variant="hero" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
                    <span className="lg:hidden">Profile</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button asChild variant="hero" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden transition-colors ${
              isScrolled || !isHomePage || isMobile ? 'text-foreground' : 'text-primary-foreground'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-primary/20 bg-background/98 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className={`px-4 py-3 transition-colors font-medium ${
                  isActive("/") 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/tours" 
                className={`px-4 py-3 transition-colors font-medium ${
                  isActive("/tours") 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                to="/about" 
                className={`px-4 py-3 transition-colors font-medium ${
                  isActive("/about") 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`px-4 py-3 transition-colors font-medium ${
                  isActive("/contact") 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 mt-2 border-t border-primary/20 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Button asChild variant="hero" size="sm" className="w-full shadow-md">
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button asChild variant="hero" size="sm" className="w-full shadow-md">
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
