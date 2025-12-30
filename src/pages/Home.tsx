import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { experiencesAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import TourCard from "@/components/TourCard";
import AIRecommendations from "@/components/AIRecommendations";
import { useTranslation } from "@/hooks/useTranslation";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  // Fetch top experiences
  const { data: topExperiencesData } = useQuery({
    queryKey: ['top-experiences'],
    queryFn: () => experiencesAPI.getTopCheap(),
  });

  const topExperiences = topExperiencesData?.data?.data || [];

  // Show "Become a Host" section to everyone (will redirect to login if not authenticated)
  const showBecomeHost = true;

  const features = [
    {
      image: "/coffee-ceremony.jpg",
      title: t("home.features.experiences.title"),
      description: t("home.features.experiences.description"),
      link: "/tours",
    },
    {
      image: "/localhome.jpg",
      title: t("home.features.hosts.title"),
      description: t("home.features.hosts.description"),
      link: "/about",
    },
    {
      image: "/ethiopian-food.jpg",
      title: t("home.features.food.title"),
      description: t("home.features.food.description"),
      link: "/tours",
    },
    {
      image: "/ethiopian-culture.jpg",
      title: t("home.features.culture.title"),
      description: t("home.features.culture.description"),
      link: "/about",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Hero />

      {/* Become a Host Section - Prominent at Top */}
      <section className="py-20 md:py-28 bg-neutral-50 border-b border-neutral-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
            >
              <div>
                <div className="inline-block mb-5">
                  <span className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium tracking-wide uppercase">
                    {t("home.becomeHost.badge")}
                  </span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 text-neutral-900 tracking-tight">
                  {t("home.becomeHost.title")} <span className="text-neutral-700">{t("home.becomeHost.titleHighlight")}</span>
                </h2>
                <p className="text-base md:text-lg text-neutral-600 mb-8 leading-relaxed">
                  {t("home.becomeHost.description")}
                </p>
                <Button 
                  asChild 
                  variant="default" 
                  size="lg" 
                  className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-none px-8 py-6 text-base font-medium tracking-wide transition-colors"
                >
                  <Link to="/host-application">
                    {t("home.becomeHost.cta")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img
                    src="/localhome.jpg"
                    alt="Become a host - Share your culture"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.endsWith('.jpg')) {
                        target.src = '/localhome.png';
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Welcome / Intro Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-8 text-neutral-900 tracking-tight">
                {t("home.intro.title")} <span className="text-neutral-700">{t("home.intro.titleHighlight")}</span>
              </h2>
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
                {t("home.intro.description")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border border-neutral-200 hover:border-neutral-300 hover:shadow-xl transition-all duration-500 bg-white overflow-hidden group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('coffee-ceremony')) {
                          target.src = '/hero.jpg';
                        } else if (target.src.includes('ethiopian-food')) {
                          target.src = '/localhome.jpg';
                        } else if (target.src.includes('ethiopian-culture')) {
                          target.src = '/collage1.jpg';
                        } else {
                          target.src = '/placeholder.svg';
                        }
                      }}
                    />
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <h3 className="font-serif text-xl md:text-2xl font-semibold mb-3 text-neutral-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed mb-6 text-sm md:text-base">
                      {feature.description}
                    </p>
                    <Link 
                      to={feature.link}
                      className="text-neutral-900 font-medium text-sm hover:text-neutral-700 inline-flex items-center gap-2 border-b border-neutral-900/20 hover:border-neutral-900/40 transition-colors pb-1"
                    >
                      {t("home.features.experiences.link")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Recommendations Section */}
      {isAuthenticated && (
        <AIRecommendations 
          userId={user?.id} 
          maxResults={6}
        />
      )}

      {/* Explore Experiences Section */}
      {topExperiences.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-5 text-neutral-900 tracking-tight">
                Explore Our <span className="text-neutral-700">Experiences</span>
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                Discover authentic cultural experiences hosted by local families across Ethiopia
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
              {topExperiences.slice(0, 6).map((experience: any, index: number) => (
                <motion.div
                  key={experience._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TourCard tour={experience} />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                asChild 
                variant="default" 
                size="lg"
                className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-none px-8 py-6 font-medium tracking-wide transition-colors"
              >
                <Link to="/tours">
                  {t("home.explore.viewAll")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}


      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-5 text-neutral-900 tracking-tight">
              {t("home.testimonials.title")} <span className="text-neutral-700">{t("home.testimonials.titleHighlight")}</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {t("home.testimonials.description")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                location: "United States",
                text: "The coffee ceremony experience was absolutely magical. Our host welcomed us into her home and shared stories that made us feel like family. Truly authentic!",
                rating: 5,
                initials: "SJ",
              },
              {
                name: "James Chen",
                location: "Singapore",
                text: "The cooking workshop was incredible! Learning traditional recipes directly from a local chef in their kitchen was an experience I'll never forget.",
                rating: 5,
                initials: "JC",
              },
              {
                name: "Emma Wilson",
                location: "United Kingdom",
                text: "The art & craft immersion was perfect! Creating pottery with a local artisan in their studio felt so personal and meaningful. Highly recommend!",
                rating: 5,
                initials: "EW",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border border-neutral-200 bg-white hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                  <CardContent className="p-8 md:p-10">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="w-12 h-12 border border-neutral-200 flex-shrink-0">
                        <AvatarFallback className="bg-neutral-100 text-neutral-700 font-medium text-sm">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-base mb-1">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-amber-500 text-lg">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-neutral-700 text-base leading-relaxed mb-8">
                      "{testimonial.text}"
                    </p>
                    {/* Subtle circular animation at bottom */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border border-neutral-300 rounded-full animate-pulse-slow" />
                        <div className="absolute inset-2 border border-neutral-400 rounded-full animate-spin-slow" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
