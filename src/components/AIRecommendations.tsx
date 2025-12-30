import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Star, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { experiencesAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import TourCard from "./TourCard";
import { useAuth } from "@/contexts/AuthContext";
import { useAI } from "@/contexts/AIContext";
import { useTranslation } from "@/hooks/useTranslation";

interface AIRecommendationsProps {
  userId?: string;
  maxResults?: number;
  title?: string;
}

const AIRecommendations = ({ 
  userId, 
  maxResults = 6,
  title
}: AIRecommendationsProps) => {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { preferences } = useAI();
  
  const displayTitle = title || t("home.recommendations.title");

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Use AI preferences and user data to get personalized recommendations
        const params: Record<string, any> = {
          limit: maxResults,
        };

        // Apply preferences if available
        if (preferences.budgetRange) {
          params["price[gte]"] = preferences.budgetRange.min;
          params["price[lte]"] = preferences.budgetRange.max;
        }

        if (preferences.location) {
          params.search = preferences.location;
        }

        // If user has interests, try to match them
        if (preferences.interests.length > 0) {
          // Search for experiences matching interests
          const interestQuery = preferences.interests.join(" ");
          params.search = params.search 
            ? `${params.search} ${interestQuery}` 
            : interestQuery;
        }

        // Default to top-rated if no preferences
        if (!params.search && !preferences.budgetRange) {
          params.sort = "-ratingsAverage,price";
        }

        const response = await experiencesAPI.getAll(params);
        const experiences = response.data?.data || response.data || [];
        
        setRecommendations(experiences.slice(0, maxResults));
      } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
        // Fallback to top cheap experiences
        try {
          const fallback = await experiencesAPI.getTopCheap();
          const experiences = fallback.data?.data || fallback.data || [];
          setRecommendations(experiences.slice(0, maxResults));
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
          setRecommendations([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, maxResults, preferences]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {displayTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: maxResults }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full animate-pulse" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {displayTitle}
            </h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/experiences">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((experience, index) => (
            <motion.div
              key={experience._id || experience.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TourCard tour={experience} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button asChild variant="default" size="lg" className="sm:hidden">
            <Link to="/experiences">
              {t("home.explore.viewAll")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default AIRecommendations;
