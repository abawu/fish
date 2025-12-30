import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface HeroProps {
  className?: string;
}

const Hero = ({ className = "" }: HeroProps) => {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero.jpg" 
          alt="Ethiopian cultural experience in a local home" 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('hero.jpg')) {
              target.src = '/localhome.jpg';
            } else if (target.src.includes('localhome.jpg')) {
              target.src = '/collage1.jpg';
            } else {
              target.src = '/placeholder.svg';
            }
          }}
        />
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Text Content - Overlaying Hero Image */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6 pt-24 md:pt-32 pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Primary Headline - Highly Centered */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-[1.15] tracking-tight drop-shadow-lg text-center mx-auto" style={{ textAlign: 'center' }}>
              Join local hosts in their homes for immersive cultural experiences
            </h1>
            
            {/* Supporting Description */}
            <p className="text-lg md:text-xl text-white/95 mb-8 leading-relaxed max-w-2xl mx-auto drop-shadow-md" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              From traditional coffee ceremonies to hands-on cooking workshops, discover authentic connections through meaningful interactions.
            </p>
            
            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center"
            >
              <Button 
                asChild 
                variant="default" 
                size="lg"
                className="bg-white text-neutral-900 hover:bg-neutral-50 rounded-none px-8 py-6 text-base font-medium tracking-wide transition-colors shadow-lg"
              >
                <Link to="/tours">
                  Explore Experiences
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
