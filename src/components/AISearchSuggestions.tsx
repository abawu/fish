import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { experiencesAPI } from "@/lib/api";

interface AISearchSuggestionsProps {
  searchQuery: string;
  onSuggestionClick: (suggestion: string) => void;
}

const AISearchSuggestions = ({ searchQuery, onSuggestionClick }: AISearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // Fetch experiences to generate smart suggestions
        const response = await experiencesAPI.getAll({ 
          limit: 10,
          search: searchQuery 
        });
        const experiences = response.data?.data || response.data || [];
        
        // Generate suggestions from experience data
        const generatedSuggestions: string[] = [];
        
        // Extract unique locations
        const locations = new Set<string>();
        experiences.forEach((exp: any) => {
          if (exp.location) {
            locations.add(exp.location);
          }
        });
        
        // Extract keywords from titles
        const keywords = new Set<string>();
        experiences.forEach((exp: any) => {
          if (exp.title) {
            const words = exp.title.toLowerCase().split(/\s+/);
            words.forEach(word => {
              if (word.length > 3 && !word.match(/^(the|and|for|with|from)$/)) {
                keywords.add(word);
              }
            });
          }
        });

        // Generate location-based suggestions
        Array.from(locations).slice(0, 3).forEach(loc => {
          generatedSuggestions.push(`Experiences in ${loc}`);
        });

        // Generate keyword-based suggestions
        Array.from(keywords).slice(0, 3).forEach(keyword => {
          generatedSuggestions.push(`${keyword.charAt(0).toUpperCase() + keyword.slice(1)} experiences`);
        });

        setSuggestions(generatedSuggestions.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch trending searches
    const fetchTrending = async () => {
      try {
        const response = await experiencesAPI.getTopCheap();
        const experiences = response.data?.data || response.data || [];
        
        const trendingTerms: string[] = [];
        experiences.slice(0, 5).forEach((exp: any) => {
          if (exp.title) {
            const words = exp.title.split(/\s+/);
            if (words.length > 0) {
              trendingTerms.push(words[0]);
            }
          }
        });
        
        setTrending(Array.from(new Set(trendingTerms)).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      }
    };

    if (!searchQuery) {
      fetchTrending();
    }
  }, [searchQuery]);

  if (!searchQuery && trending.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {(suggestions.length > 0 || trending.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 z-50 mt-2"
        >
          <Card className="shadow-lg border-2 border-primary/20">
            <CardContent className="p-4">
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">AI Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => onSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {!searchQuery && trending.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-semibold text-foreground">Trending Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((term, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary/10 hover:text-secondary transition-colors"
                        onClick={() => onSuggestionClick(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISearchSuggestions;
