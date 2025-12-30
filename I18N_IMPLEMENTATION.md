# Internationalization (i18n) Implementation

## Overview

This document describes the multi-language support implementation for the Hulet Fish platform. The system supports English (default), Amharic, and Arabic languages with full RTL (Right-to-Left) support for Arabic.

## Features Implemented

### 1. Language Selector

**Location**: Fixed at the very top of the page, above the navigation bar

**Features**:
- Clean dropdown selector matching the design system
- Displays language names in their native scripts:
  - English
  - አማርኛ (Amharic)
  - العربية (Arabic)
- Persists selection in localStorage
- Updates document direction (LTR/RTL) automatically
- Accessible with ARIA labels

**Component**: `src/components/LanguageSelector.tsx`

### 2. Translation System

**Architecture**:
- Key-based translation structure
- Centralized translation files in `src/lib/i18n/translations/`
- Type-safe translation keys
- Automatic fallback to English if translation missing

**Translation Files**:
- `src/lib/i18n/translations/en.ts` - English (default)
- `src/lib/i18n/translations/am.ts` - Amharic
- `src/lib/i18n/translations/ar.ts` - Arabic

### 3. RTL Support

**Features**:
- Automatic direction switching for Arabic (RTL)
- CSS adjustments for RTL layouts
- Text alignment handling
- Flex direction adjustments
- Margin/padding reversals where needed

**Implementation**: 
- `src/lib/i18n/index.ts` → `getTextDirection()`
- `src/index.css` → RTL-specific styles

### 4. Translated Components

All major components have been updated with translations:

**Navigation**:
- Menu items (Tour Experiences, Hosts, Culture, Food, About, Contact)
- Auth buttons (Log In, Book, Profile)

**Home Page**:
- Hero section (title, description, CTA)
- Intro section
- Feature cards
- Explore section
- Become a Host section
- Testimonials section

**Tours/Experiences Page**:
- Page header
- Search placeholder
- Filter labels
- Sort options
- Results count
- Pagination
- Empty states

**Footer**:
- Description
- Quick Links
- Contact section
- Newsletter
- Legal links

**AI Chat**:
- Welcome message
- Input placeholder
- Suggestions

**Other Components**:
- AI Recommendations
- Common UI elements

## Usage

### Using Translations in Components

```typescript
import { useTranslation } from "@/hooks/useTranslation";

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <h1>{t("home.hero.title")}</h1>
  );
};
```

### Translation Key Structure

Translation keys use dot notation for nested objects:

```typescript
// Navigation
t("nav.tourExperiences")
t("nav.hosts")
t("nav.culture")

// Home page
t("home.hero.title")
t("home.hero.description")
t("home.features.experiences.title")

// Tours page
t("tours.title")
t("tours.searchPlaceholder")
t("tours.sortBy")

// Common
t("common.loading")
t("common.error")
```

## Technical Details

### Language Context

**File**: `src/contexts/LanguageContext.tsx`

**Features**:
- Manages current language state
- Persists to localStorage
- Updates document direction and lang attribute
- Provides `language`, `setLanguage()`, and `direction`

### Translation Hook

**File**: `src/hooks/useTranslation.ts`

**Usage**:
```typescript
const { t, language } = useTranslation();
```

### Translation Function

**File**: `src/lib/i18n/index.ts`

**Features**:
- Nested key access (e.g., "home.hero.title")
- Automatic fallback to English
- Returns key if translation not found

## Styling Considerations

### RTL Support

The CSS includes RTL-specific rules:
- Text alignment adjustments
- Flex direction reversals
- Margin/padding reversals

### Text Wrapping

- Word wrapping enabled for longer Amharic/Arabic text
- Overflow handling
- Responsive text sizing

## Adding New Translations

1. **Add to English file** (`src/lib/i18n/translations/en.ts`):
```typescript
export const en = {
  // ... existing
  newSection: {
    title: "New Title",
    description: "New Description",
  },
};
```

2. **Add to Amharic file** (`src/lib/i18n/translations/am.ts`):
```typescript
export const am = {
  // ... existing
  newSection: {
    title: "አዲስ ርዕስ",
    description: "አዲስ መግለጫ",
  },
};
```

3. **Add to Arabic file** (`src/lib/i18n/translations/ar.ts`):
```typescript
export const ar = {
  // ... existing
  newSection: {
    title: "عنوان جديد",
    description: "وصف جديد",
  },
};
```

4. **Use in component**:
```typescript
const { t } = useTranslation();
<h1>{t("newSection.title")}</h1>
```

## Accessibility

- ARIA labels on language selector
- Keyboard navigation support
- Screen reader friendly
- Proper semantic HTML

## Performance

- Translations loaded at build time (no runtime fetching)
- Minimal bundle size impact
- Efficient key lookup
- No re-renders on language change (only affected components)

## Browser Support

- All modern browsers
- RTL support in Chrome, Firefox, Safari, Edge
- localStorage for persistence

## Future Enhancements

1. **Additional Languages**: Easy to add more languages by creating new translation files
2. **Pluralization**: Add plural form handling
3. **Date/Number Formatting**: Locale-specific formatting
4. **Dynamic Loading**: Lazy load translation files for better performance
5. **Translation Management**: Admin interface for managing translations

## Testing

### Manual Testing

1. **Language Selection**:
   - Select different languages from dropdown
   - Verify all text changes
   - Check localStorage persistence
   - Refresh page and verify language persists

2. **RTL Support**:
   - Select Arabic
   - Verify text alignment is right-aligned
   - Check navigation and layout flow
   - Verify flex layouts work correctly

3. **Text Wrapping**:
   - Test with Amharic text (longer strings)
   - Verify no layout breaks
   - Check responsive behavior

4. **Fallback**:
   - Remove a translation key
   - Verify English fallback works
   - Check console for any errors

## Files Modified/Created

### New Files
- `src/lib/i18n/index.ts`
- `src/lib/i18n/translations/en.ts`
- `src/lib/i18n/translations/am.ts`
- `src/lib/i18n/translations/ar.ts`
- `src/contexts/LanguageContext.tsx`
- `src/components/LanguageSelector.tsx`
- `src/hooks/useTranslation.ts`

### Modified Files
- `src/App.tsx` - Added LanguageProvider
- `src/components/Navigation.tsx` - Added translations
- `src/components/Hero.tsx` - Added translations
- `src/components/Footer.tsx` - Added translations
- `src/components/AIChat.tsx` - Added translations
- `src/components/AIRecommendations.tsx` - Added translations
- `src/pages/Home.tsx` - Added translations
- `src/pages/Tours.tsx` - Added translations
- `src/index.css` - Added RTL support

## Notes

- All UI layouts, styling, and animations remain unchanged
- The language selector is positioned at the very top, above navigation
- Navigation bar is positioned below the language selector (top-8)
- RTL support is automatic for Arabic
- Text wrapping handles longer Amharic/Arabic strings gracefully


