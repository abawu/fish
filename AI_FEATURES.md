# AI-Powered Features Documentation

## Overview

This document describes the AI-powered features integrated into the Hulet Fish platform. These features enhance user experience by providing intelligent assistance, personalized recommendations, and smart search capabilities.

## Features Implemented

### 1. AI Chat Assistant

**Location**: Floating widget on all pages (bottom-right corner)

**Features**:
- **Intelligent Conversations**: Context-aware responses based on user queries
- **Real-time Experience Recommendations**: Fetches and displays actual experiences from the database
- **Smart Suggestions**: Provides clickable suggestions based on conversation context
- **Personalized Responses**: Adapts to user authentication status and preferences
- **Beautiful UI**: Modern, animated chat interface matching the platform's design system

**Usage**:
- Click the floating chat button (bottom-right) to open
- Ask questions like:
  - "Show me coffee ceremony experiences"
  - "Find budget-friendly options"
  - "What's popular?"
  - "Tell me about Ethiopian culture"

**Technical Details**:
- Component: `src/components/AIChat.tsx`
- API Integration: `src/lib/api.ts` → `aiChatAPI.sendMessage()`
- Context: `src/contexts/AIContext.tsx`

### 2. AI-Powered Recommendations

**Location**: Home page (for authenticated users)

**Features**:
- **Personalized Suggestions**: Uses user preferences and behavior to recommend experiences
- **Dynamic Filtering**: Applies budget, location, and interest-based filters
- **Real-time Updates**: Fetches fresh recommendations based on current preferences
- **Fallback to Top Experiences**: Shows top-rated experiences if no preferences set

**Usage**:
- Automatically displayed on home page for logged-in users
- Preferences are learned from chat interactions and user behavior
- Updates dynamically as preferences change

**Technical Details**:
- Component: `src/components/AIRecommendations.tsx`
- Integrated in: `src/pages/Home.tsx`
- Uses: `experiencesAPI.getAll()` with smart filtering

### 3. AI-Powered Smart Search

**Location**: Tours/Experiences page search bar

**Features**:
- **Intelligent Suggestions**: Provides AI-generated search suggestions as you type
- **Trending Searches**: Shows popular search terms when search bar is empty
- **Context-Aware**: Suggestions based on actual experience data
- **Clickable Badges**: Quick selection of suggested searches

**Usage**:
- Start typing in the search bar on `/tours` or `/experiences`
- See AI-generated suggestions appear below
- Click any suggestion to apply it
- View trending searches when search is empty

**Technical Details**:
- Component: `src/components/AISearchSuggestions.tsx`
- Integrated in: `src/pages/Tours.tsx`
- Uses: `experiencesAPI.getAll()` and `experiencesAPI.getTopCheap()`

## Architecture

### Components Structure

```
src/
├── components/
│   ├── AIChat.tsx              # Main chat widget
│   ├── AIRecommendations.tsx   # Personalized recommendations
│   └── AISearchSuggestions.tsx # Smart search suggestions
├── contexts/
│   └── AIContext.tsx           # AI state management
└── lib/
    └── api.ts                  # AI API integration
```

### Context Providers

The AI features use React Context for state management:

- **AIProvider**: Manages chat history and user preferences
- **AuthProvider**: Provides user authentication context
- **QueryClientProvider**: Handles API data fetching

### API Integration

Currently, the AI features use a **hybrid approach**:

1. **Frontend Intelligence**: Keyword-based pattern matching for quick responses
2. **Real Data Integration**: Fetches actual experiences from the backend API
3. **Extensible Design**: Ready to connect to a real AI backend service

**To connect to a real AI backend**:

Update `src/lib/api.ts` → `aiChatAPI.sendMessage()`:

```typescript
sendMessage: async (payload) => {
  // Replace mock implementation with:
  const response = await api.post("/ai/chat", payload);
  return response.data;
}
```

## Customization

### Chat Widget Styling

The chat widget uses the platform's design system:
- Primary colors for branding
- Consistent spacing and typography
- Responsive design (mobile-friendly)

### Recommendation Algorithm

Customize recommendations in `src/components/AIRecommendations.tsx`:

```typescript
// Adjust filtering logic
const params = {
  limit: maxResults,
  sort: "-ratingsAverage,price", // Change sorting
  // Add custom filters
};
```

### Search Suggestions

Modify suggestion generation in `src/components/AISearchSuggestions.tsx`:

```typescript
// Customize how suggestions are generated
// from experience data
```

## Future Enhancements

### Planned Features

1. **Advanced AI Backend Integration**
   - Connect to OpenAI, Anthropic, or custom AI service
   - Natural language understanding
   - Multi-turn conversation context

2. **Machine Learning Recommendations**
   - Collaborative filtering
   - User behavior analysis
   - Seasonal trend detection

3. **Voice Interface**
   - Voice input for chat
   - Audio responses
   - Accessibility improvements

4. **Multi-language Support**
   - Amharic language support
   - Automatic translation
   - Cultural context awareness

5. **Analytics Dashboard**
   - Track AI usage
   - Measure recommendation effectiveness
   - User satisfaction metrics

## Environment Variables

No additional environment variables are required for basic functionality. For production AI backend integration, add:

```env
VITE_AI_API_URL=https://your-ai-backend.com/api
VITE_AI_API_KEY=your-api-key
```

## Testing

### Manual Testing

1. **Chat Widget**:
   - Open chat and test various queries
   - Verify experience recommendations appear
   - Test suggestion clicks

2. **Recommendations**:
   - Login and check home page
   - Verify personalized recommendations
   - Test preference updates

3. **Search Suggestions**:
   - Type in search bar
   - Verify suggestions appear
   - Test clicking suggestions

### Automated Testing

Add tests in:
- `src/components/__tests__/AIChat.test.tsx`
- `src/components/__tests__/AIRecommendations.test.tsx`
- `src/components/__tests__/AISearchSuggestions.test.tsx`

## Performance Considerations

- **Lazy Loading**: Chat widget loads on demand
- **Debounced Search**: Search suggestions debounced (300ms)
- **Cached Responses**: Consider caching frequent queries
- **Optimistic Updates**: UI updates immediately, syncs with backend

## Security

- **Input Sanitization**: All user inputs are sanitized
- **Rate Limiting**: Consider adding rate limits for AI endpoints
- **Data Privacy**: User data handled according to privacy policy
- **API Keys**: Store securely, never expose in frontend code

## Support

For issues or questions:
1. Check component console logs
2. Verify API endpoints are accessible
3. Review browser network tab for API calls
4. Check that all dependencies are installed

## License

Same as main project license.
