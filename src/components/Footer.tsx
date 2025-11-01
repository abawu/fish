import { Mountain, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import textilePattern from "@/assets/ethiopian-textile.jpg";

const Footer = () => {
  const { user } = useAuth();

  const reviewsLink = user ? "/my-reviews" : "/login";

  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <img
          src={textilePattern}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-3xl font-bold mb-4"
            >
              <Mountain className="w-8 h-8 text-secondary" />
              <span>HUlet fish</span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Connect with local families through authentic home experiences. 
              From coffee ceremonies to cooking workshops, discover meaningful 
              cultural connections that create lasting memories.
            </p>
            <div className="flex gap-4">
              <a
                href="/"
                className="w-10 h-10 rounded-full bg-secondary/20 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="/"
                className="w-10 h-10 rounded-full bg-secondary/20 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="/"
                className="w-10 h-10 rounded-full bg-secondary/20 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@huletfish.com"
                className="w-10 h-10 rounded-full bg-secondary/20 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-secondary">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/tours"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  All Experiences
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/tours"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  Home Experiences
                </Link>
              </li>
              <li>
                <Link
                  to={reviewsLink}
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-secondary">
              Contact
            </h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li>Addis Ababa, Ethiopia</li>
              <li>hello@huletfish.com</li>
              <li>+251 11 123 4567</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} HUlet fish. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-secondary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-secondary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
