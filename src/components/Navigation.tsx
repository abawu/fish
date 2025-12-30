import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, X, User, ChevronDown, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n";

const languageNames: Record<Language, string> = {
  en: "English",
  am: "አማርኛ",
  ar: "العربية",
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const textColor = isScrolled || !isHomePage 
    ? 'text-foreground' 
    : 'text-white';

  const borderColor = isScrolled || !isHomePage 
    ? 'border-neutral-200' 
    : 'border-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled || !isHomePage
        ? 'bg-white border-b border-neutral-200' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link 
            to="/" 
            className={`font-sans text-lg font-semibold tracking-tight transition-colors ${textColor} hover:opacity-80`}
          >
            Hulet Fish
          </Link>

          {/* Desktop Navigation - Center/Right */}
          <div className="hidden md:flex items-center gap-8">
            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className={`text-sm font-normal tracking-wide transition-colors ${
                  isActive("/") && location.pathname === "/"
                    ? `${textColor} font-medium` 
                    : `${textColor} opacity-70 hover:opacity-100`
                }`}
              >
                {t("nav.home")}
              </Link>
              <Link 
                to="/tours" 
                className={`text-sm font-normal tracking-wide transition-colors ${
                  isActive("/tours") || isActive("/experiences")
                    ? `${textColor} font-medium` 
                    : `${textColor} opacity-70 hover:opacity-100`
                }`}
              >
                {t("nav.tourExperiences")}
              </Link>
              <Link 
                to="/host-application" 
                className={`text-sm font-normal tracking-wide transition-colors ${
                  isActive("/host-application")
                    ? `${textColor} font-medium` 
                    : `${textColor} opacity-70 hover:opacity-100`
                }`}
              >
                {t("nav.becomeHost")}
              </Link>
            </div>

            {/* Language Selector & Login/Auth - Far Right */}
            <div className="flex items-center gap-4 ml-8 pl-8 border-l border-neutral-200">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Select 
                  value={language} 
                  onValueChange={(value) => setLanguage(value as Language)}
                >
                  <SelectTrigger 
                    className="w-[120px] h-8 text-sm border-neutral-200 bg-background hover:bg-neutral-50"
                    aria-label="Select language"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{languageNames.en}</SelectItem>
                    <SelectItem value="am">{languageNames.am}</SelectItem>
                    <SelectItem value="ar">{languageNames.ar}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Login/Auth */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`h-9 px-3 font-normal text-sm ${textColor} hover:bg-neutral-100 focus-visible:ring-0`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="hidden lg:inline">{user?.name?.split(' ')[0] || t("nav.profile")}</span>
                      <span className="lg:hidden">{t("nav.profile")}</span>
                      <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        {t("nav.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-bookings" className="cursor-pointer">
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/host-application" className="cursor-pointer">
                        {t("nav.becomeHost")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="default" 
                      className="h-9 px-4 bg-neutral-900 text-white hover:bg-neutral-800 font-normal text-sm rounded-sm"
                    >
                      {t("nav.logIn")}
                      <ChevronDown className="w-3 h-3 ml-2 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer font-medium">
                        {t("nav.logIn")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="cursor-pointer">
                        {t("nav.signUp")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ${textColor} transition-colors p-2`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t ${borderColor} bg-white`}>
            <div className="flex flex-col gap-1">
              <Link 
                to="/" 
                className={`px-4 py-2.5 text-sm font-normal transition-colors ${
                  isActive("/") && location.pathname === "/"
                    ? "text-foreground font-medium" 
                    : "text-foreground opacity-70 hover:opacity-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link 
                to="/tours" 
                className={`px-4 py-2.5 text-sm font-normal transition-colors ${
                  isActive("/tours") || isActive("/experiences")
                    ? "text-foreground font-medium" 
                    : "text-foreground opacity-70 hover:opacity-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.tourExperiences")}
              </Link>
              <Link 
                to="/host-application" 
                className={`px-4 py-2.5 text-sm font-normal transition-colors ${
                  isActive("/host-application")
                    ? "text-foreground font-medium" 
                    : "text-foreground opacity-70 hover:opacity-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.becomeHost")}
              </Link>
              {/* Language Selector - Mobile */}
              <div className="pt-4 mt-2 border-t border-neutral-200">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Select 
                    value={language} 
                    onValueChange={(value) => setLanguage(value as Language)}
                  >
                    <SelectTrigger 
                      className="w-full h-9 text-sm border-neutral-200 bg-background"
                      aria-label="Select language"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{languageNames.en}</SelectItem>
                      <SelectItem value="am">{languageNames.am}</SelectItem>
                      <SelectItem value="ar">{languageNames.ar}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-2 border-t border-neutral-200 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="ghost" className="w-full justify-start font-normal text-sm">
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        {t("nav.profile")}
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start font-normal text-sm">
                      <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)}>
                        My Bookings
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="default" className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-normal text-sm rounded-sm">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        {t("nav.logIn")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full font-normal text-sm rounded-sm border-neutral-300">
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                        {t("nav.signUp")}
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
