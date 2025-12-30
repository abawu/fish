import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, TranslationKey } from "@/lib/i18n";

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return { t, language };
};


