import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  MapPin,
  Star,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  MessageSquare,
  Heart,
} from "lucide-react";
import { usersAPI, experiencesAPI, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import HostBadge from "@/components/HostBadge";
import TourCard from "@/components/TourCard";
import { motion } from "framer-motion";

const HostProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [host, setHost] = useState<any | null>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);

  useEffect(() => {
    const fetchHost = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Host ID is missing",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        const response = await usersAPI.getHostById(id);
        const hostData = response.data?.data || response.data || response;
        setHost(hostData);

        // Fetch host's experiences
        setIsLoadingExperiences(true);
        const expResponse = await experiencesAPI.getAll({ host: id });
        const expList =
          expResponse?.data?.data || expResponse?.data || [];
        setExperiences(Array.isArray(expList) ? expList : []);
      } catch (err: any) {
        console.error("Failed to fetch host:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load host profile",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
        setIsLoadingExperiences(false);
      }
    };

    fetchHost();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">{t("hostProfile.loading")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!host) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">{t("hostProfile.notFound")}</p>
            <Button onClick={() => navigate("/")}>
              {t("hostProfile.backToHome")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hostId = host._id || host.id;
  const hostName = host.name || host.email || "Host";
  const hostPhoto = host.photo;
  const hostEmail = host.email;
  const hostLocation = host.location || host.personalInfo?.cityRegion || "";
  const hostAbout = host.about || host.personalInfo?.aboutYou || "";
  const hostLanguages = host.personalInfo?.languagesSpoken || [];
  const isVerified = host.hostStatus === "approved";
  const experienceCount = experiences.length;

  // Calculate average rating from experiences
  const avgRating =
    experiences.length > 0
      ? experiences.reduce((sum, exp) => sum + (exp.ratingsAverage || 0), 0) /
        experiences.length
      : 0;
  const totalReviews = experiences.reduce(
    (sum, exp) => sum + (exp.ratingsQuantity || 0),
    0
  );

  // Determine badges
  const badges: Array<"verified" | "expert" | "experienced" | "top-rated"> = [];
  if (isVerified) badges.push("verified");
  if (experienceCount >= 3) badges.push("experienced");
  if (avgRating >= 4.5 && totalReviews >= 5) badges.push("top-rated");
  if (hostAbout.toLowerCase().includes("culture") || hostAbout.toLowerCase().includes("traditional")) {
    badges.push("expert");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("hostProfile.back")}
          </Button>

          {/* Host Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Host Photo */}
                  <div className="flex-shrink-0">
                    {hostPhoto ? (
                      <Avatar className="w-32 h-32 border-4 border-primary/20">
                        <AvatarImage
                          src={
                            String(hostPhoto).startsWith("/")
                              ? `${API_ORIGIN}${hostPhoto}`
                              : hostPhoto
                          }
                          alt={hostName}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                          {(() => {
                            const parts = hostName.trim().split(/\s+/);
                            if (parts.length >= 2) {
                              return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                            }
                            return hostName.substring(0, 2).toUpperCase();
                          })()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold border-4 border-primary/20">
                        {(() => {
                          const parts = hostName.trim().split(/\s+/);
                          if (parts.length >= 2) {
                            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                          }
                          return hostName.substring(0, 2).toUpperCase();
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Host Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                      <h1 className="text-3xl font-bold text-foreground">
                        {hostName}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        {badges.map((badge) => (
                          <HostBadge key={badge} type={badge} />
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 mb-4">
                      {avgRating > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-secondary fill-secondary" />
                          <span className="font-semibold">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground">
                            ({totalReviews} {t("hostProfile.reviews")})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{experienceCount}</span>
                        <span className="text-muted-foreground">
                          {t("hostProfile.experiences")}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {hostEmail && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{hostEmail}</span>
                        </div>
                      )}
                      {hostLocation && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{hostLocation}</span>
                        </div>
                      )}
                      {hostLanguages.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          <span>
                            {Array.isArray(hostLanguages)
                              ? hostLanguages.filter((l: any) => l && typeof l === "string").join(", ")
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            {hostAbout && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {t("hostProfile.about")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hostAbout}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experiences Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {t("hostProfile.hostExperiences")} ({experienceCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingExperiences ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : experiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {experiences.map((experience) => (
                      <TourCard key={experience._id || experience.id} tour={experience} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>{t("hostProfile.noExperiences")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HostProfile;


