import { Facebook, Instagram, Twitter, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative bg-foreground text-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-block font-serif text-2xl md:text-3xl font-bold mb-4 text-white hover:text-primary transition-colors"
            >
              Hulet Fish
            </Link>
            <p className="text-white/70 text-sm md:text-base mb-6 max-w-md leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@huletfish.com"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wide">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/tours"
                  className="text-white/70 hover:text-white transition-colors text-sm inline-block"
                >
                  {t("nav.tourExperiences")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/70 hover:text-white transition-colors text-sm inline-block"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/70 hover:text-white transition-colors text-sm inline-block"
                >
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link
                  to="/host-application"
                  className="text-white/70 hover:text-white transition-colors text-sm inline-block"
                >
                  {t("home.becomeHost.cta")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wide">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3 text-white/70 text-sm mb-6">
              <li>Addis Ababa, Ethiopia</li>
              <li>
                <a 
                  href="mailto:hello@huletfish.com" 
                  className="hover:text-white transition-colors"
                >
                  hello@huletfish.com
                </a>
              </li>
              <li>+251 11 123 4567</li>
            </ul>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wide">
                {t("footer.newsletter")}
              </h3>
              <p className="text-white/70 text-sm mb-3">
                {t("footer.newsletterDescription")}
              </p>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-sm focus:border-primary"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-primary text-white hover:bg-primary/90 rounded-sm"
                  aria-label={t("footer.subscribe")}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>
            {t("footer.copyright")}
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-white transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              to="/terms"
              className="hover:text-white transition-colors"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
