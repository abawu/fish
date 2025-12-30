import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n";

const languageNames: Record<Language, string> = {
  en: "English",
  am: "አማርኛ",
  ar: "العربية",
};

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="w-full bg-muted/50 border-b border-border py-2 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Select 
              value={language} 
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger 
                className="w-[140px] h-8 text-sm border-border bg-background"
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
      </div>
    </div>
  );
};

export default LanguageSelector;


