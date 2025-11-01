import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { API_ORIGIN } from "@/lib/api";
import { motion } from "framer-motion";

interface TourCardProps {
  tour: {
    _id?: string;
    id?: string | number;
    title: string;
    duration: string;
    maxGuests: number;
    ratingsAverage: number;
    ratingsQuantity: number;
    price: number;
    summary: string;
    imageCover: string;
  };
}

const TourCard = ({ tour }: TourCardProps) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="group overflow-hidden hover-lift shadow-lg hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20">
        {/* Experience Image */}
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/80 z-10" />
          <img
            src={
              tour.imageCover && String(tour.imageCover).startsWith("/")
                ? `${API_ORIGIN}${tour.imageCover}`
                : tour.imageCover ||
                  `https://placehold.co/600x400/2d5a3d/ffd700?text=${encodeURIComponent(
                    tour.title
                  )}`
            }
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <CardContent className="p-6">
          {/* Experience Header */}
          <div className="mb-4">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {tour.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {tour.summary}
            </p>
          </div>

          {/* Experience Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {tour.duration}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                Max {tour.maxGuests} guests
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-muted-foreground">
                {tour.ratingsAverage} ({tour.ratingsQuantity})
              </span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Per guest</span>
              <p className="text-3xl font-bold text-primary">
                ETB {tour.price}
              </p>
            </div>
            <Button asChild variant="adventure" size="default">
              <Link to={`/experiences/${tour._id ?? tour.id}`}>Join Experience</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TourCard;
