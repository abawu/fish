import { en } from "./translations/en";
import { am } from "./translations/am";
import { ar } from "./translations/ar";

export type Language = "en" | "am" | "ar";

export const translations = {
  en,
  am,
  ar,
} as const;

export type TranslationKey = keyof typeof en;

// Helper function to get nested translation value
export const getTranslation = (
  lang: Language,
  key: string
): string => {
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k as keyof typeof value];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === "object" && fallbackKey in value) {
          value = value[fallbackKey as keyof typeof value];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }

  return typeof value === "string" ? value : key;
};

// Get direction for RTL languages
export const getTextDirection = (lang: Language): "ltr" | "rtl" => {
  return lang === "ar" ? "rtl" : "ltr";
};


