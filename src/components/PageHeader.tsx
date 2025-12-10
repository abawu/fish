import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string;
  className?: string;
}

const PageHeader = ({ title, description, className = "" }: PageHeaderProps) => {
  const isCentered = className.includes("text-center");
  
  return (
    <section className={`relative bg-gradient-to-br from-primary/15 via-primary-light/10 to-earth/10 py-20 md:py-28 border-b border-primary/20 overflow-hidden ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/25 via-primary/15 to-background/40" />
      <div className="absolute inset-0 bg-muted/5" />
      <div className="absolute inset-0 pattern-ethiopian opacity-5" />
      
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`max-w-4xl ${isCentered ? "mx-auto text-center" : ""}`}
        >
          <div className="inline-block mb-4">
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary-light rounded-full" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHeader;

