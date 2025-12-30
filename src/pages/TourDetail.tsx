import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  X,
  User,
} from "lucide-react";
import { experiencesAPI, reviewsAPI, bookingsAPI, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const TourDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [experience, setExperience] = useState<any | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    null
  );
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit, setReviewLimit] = useState(3); // Show 3 reviews initially, load 3 more each time
  const [reviewSort, setReviewSort] = useState("-createdAt");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [numGuests, setNumGuests] = useState<number>(1);
  const [availability, setAvailability] = useState<{available: number; booked: number; maxGuests: number} | null>(null);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [hasBooked, setHasBooked] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  const toastRef = useRef(toast);
  
  // Keep toast ref updated
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    const fetchExperience = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await experiencesAPI.getById(id);
          const t = response.data.data;
          setExperience(t);
          setSelectedStartDate(null);
        } catch (err: any) {
          console.error("Failed to fetch experience:", err);
          // Don't show error toast for 401/403 errors - user might not be logged in
          // This is expected for public access attempts, but the backend route is public
          // So if we get 401/403, it might be a different issue - still don't show toast
          const status = err.response?.status;
          if (status !== 401 && status !== 403) {
            toastRef.current({
              title: "Error",
              description: err.response?.data?.message || "Failed to load experience from server.",
              variant: "destructive",
            });
          }
          setExperience(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExperience();
  }, [id]);

  // Check if current user has a booking for this experience
  const experienceId = experience?._id ?? experience?.id ?? null;
  const userId = (user as any)?._id ?? (user as any)?.id ?? null;
  
  useEffect(() => {
    const checkBooking = async () => {
      if (!isAuthenticated || !experienceId) {
        setHasBooked(false);
        return;
      }
      try {
        const resp = await bookingsAPI.getMyBookings();
        // normalize response to array of bookings
        let bookingsList: any[] = [];
        if (Array.isArray(resp)) bookingsList = resp;
        else if (Array.isArray((resp as any).data))
          bookingsList = (resp as any).data;
        else if (Array.isArray((resp as any).data?.data))
          bookingsList = (resp as any).data.data;

        const found = bookingsList.find((b: any) => {
          const bExperienceId = b.experience?._id ?? b.experience?.id ?? b.experience;
          return String(bExperienceId) === String(experienceId);
        });
        setHasBooked(!!found);
      } catch (err) {
        // ignore silently
        setHasBooked(false);
      }
    };
    checkBooking();
  }, [experienceId, isAuthenticated, userId]);

  const fetchReviews = useCallback(async (append = false) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await reviewsAPI.getReviewsForExperience(id, {
        page: reviewPage,
        limit: reviewLimit,
        sort: reviewSort,
      });
      
      // Store total count if available
      if (response?.results !== undefined) {
        setTotalReviews(response.results);
      } else if (response?.data?.results !== undefined) {
        setTotalReviews(response.data.results);
      }
      
      const newReviews = response.data?.data || response.data || [];
      
      // Append reviews if loading more, otherwise replace
      if (append && reviewPage > 1) {
        setReviews((prev) => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }

      // Check if current user has already reviewed this experience
      if (userId && isAuthenticated) {
        const userReview = newReviews.find((review: any) => {
          // Handle both populated and non-populated user references
          const reviewUserId =
            review.user?._id ?? review.user?.id ?? review.user;
          return String(reviewUserId) === String(userId);
        });
        setHasUserReviewed(!!userReview);
      } else {
        setHasUserReviewed(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);
      // Reviews are now public, but handle errors gracefully
      const status = err.response?.status;
      // Only show error for non-auth errors (reviews should be public now)
      if (status !== 401 && status !== 403) {
        toastRef.current({
          title: "Error",
          description: err.response?.data?.message || "Failed to load reviews.",
          variant: "destructive",
        });
      }
      // Reset reviews on error to show empty state
      if (!append) {
        setReviews([]);
        setTotalReviews(0);
      }
    } finally {
      setReviewsLoading(false);
    }
  }, [id, reviewPage, reviewLimit, reviewSort, userId, isAuthenticated]);

  useEffect(() => {
    // Reset to page 1 when id or sort changes
    setReviewPage(1);
  }, [id, reviewSort]);

  useEffect(() => {
    // Fetch reviews when page changes
    if (reviewPage === 1) {
      fetchReviews(false);
    } else if (reviewPage > 1) {
      fetchReviews(true);
    }
  }, [reviewPage, fetchReviews]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!id) return;
      try {
        const resp = await bookingsAPI.getAvailability(id);
        const data = resp.data || resp;
        const a = data.data || data;
        setAvailability(a);
        // Adjust max for selector only if current selection exceeds available
        if (a && a.available > 0) {
          setNumGuests((g) => {
            const maxAllowed = Math.min(Number(experience?.maxGuests) || 1, a.available);
            return Math.min(g, maxAllowed);
          });
        }
      } catch {
        // ignore
      }
    };
    loadAvailability();
  }, [id, experience?.maxGuests]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading experience...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Experience Not Found</h1>
            <Button asChild variant="adventure">
              <Link to="/experiences">Back to Experiences</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      return;
    }

    if (!newReview || newRating === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in review and rating",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.createReviewForExperience(id!, {
        review: newReview,
        rating: newRating,
      });
      // Refetch reviews so newly created review is returned in the same format as others
      await fetchReviews();
      setNewReview("");
      setNewRating(0);
      setHasUserReviewed(true);
      setReviewModalOpen(false);
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-secondary fill-secondary" : "text-muted"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Title & Quick Info */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link to="/experiences">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Experiences
              </Link>
            </Button>
          </div>
          <div className="bg-gradient-to-br from-background via-background to-primary/10 rounded-lg p-6 shadow-md border">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                {experience.duration}
              </Badge>
              <div className="flex items-center gap-1 text-secondary bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-secondary" />
                <span className="font-semibold">{experience.ratingsAverage}</span>
                <span className="text-muted-foreground text-sm">
                  ({experience.ratingsQuantity} reviews)
                </span>
              </div>
              {availability && availability.available === 0 && (
                <Badge variant="destructive">Sold out</Badge>
              )}
              {availability && availability.available > 0 && (
                <Badge variant="secondary">{availability.available} left</Badge>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-0">
              {experience.title}
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10 md:space-y-12">
                {/* Overview */}
                <div className="animate-fade-in space-y-6">
                  <div className="border-b border-border pb-4">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                      Overview
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">
                      {experience.summary}
                    </p>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {experience.description}
                    </p>
                  </div>
                </div>

                {/* Quick Facts */}
                <Card className="border-2 shadow-lg">
                  <CardContent className="p-6 md:p-8">
                    <div className="border-b border-border pb-4 mb-6">
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                        Quick Facts
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Duration
                          </p>
                          <p className="text-muted-foreground">
                            {experience.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Max Guests
                          </p>
                          <p className="text-muted-foreground">
                            Max {experience.maxGuests} guests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Location
                          </p>
                          <p className="text-muted-foreground">
                            {experience.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-secondary fill-secondary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Rating
                          </p>
                          <p className="text-muted-foreground">
                            {experience.ratingsAverage} / 5
                          </p>
                        </div>
                      </div>
                      {experience.nextOccurrenceAt && (
                        <div className="flex items-start gap-3 col-span-2">
                          <Calendar className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <p className="font-semibold text-foreground mb-1">
                              Next Occurrence
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(experience.nextOccurrenceAt).toLocaleString()}
                            </p>
                            {experience.expirationWindowHours && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Bookings expire {experience.expirationWindowHours} hours after the experience date
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Images Grid */}
                <div>
                  <div className="border-b border-border pb-4 mb-6">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      Gallery
                    </h3>
                  </div>
                  {(experience.images && experience.images.length > 0) || experience.imageCover ? (
                    <>
                      {/* Gallery Grid - Includes Cover Image */}
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {(() => {
                          // Create array of all images with cover first if it exists and isn't already in images
                          const allImages: string[] = [];
                          const coverInImages = experience.imageCover && experience.images?.includes(experience.imageCover);
                          
                          // Add cover image first if it exists and isn't already in the images array
                          if (experience.imageCover && !coverInImages) {
                            allImages.push(experience.imageCover);
                          }
                          
                          // Add all gallery images
                          if (experience.images) {
                            allImages.push(...experience.images);
                          }
                          
                          return allImages.map((image: string, displayIndex: number) => {
                            const isCover = displayIndex === 0 && experience.imageCover && !coverInImages;
                            // Find the index in the original images array for lightbox navigation
                            let lightboxIndex: number;
                            if (isCover) {
                              // Cover image - find its index in images array, or use 0
                              lightboxIndex = experience.images?.findIndex((img: string) => img === experience.imageCover) ?? 0;
                            } else {
                              // Regular image - adjust index if cover was added
                              const offset = (experience.imageCover && !coverInImages) ? 1 : 0;
                              lightboxIndex = displayIndex - offset;
                            }
                            
                            return (
                              <div
                                key={displayIndex}
                                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                                onClick={() => {
                                  setSelectedImageIndex(Math.max(0, lightboxIndex));
                                  setLightboxOpen(true);
                                }}
                              >
                                <img
                                  src={
                                    image && String(image).startsWith("/")
                                      ? `${API_ORIGIN}${image}`
                                      : image ||
                                        `https://placehold.co/400x400/2d5a3d/ffd700?text=Image+${
                                          displayIndex + 1
                                        }`
                                  }
                                  alt={isCover ? experience.title : `${experience.title} ${displayIndex + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                {isCover && (
                                  <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                                    Cover
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground text-lg">
                          No images available
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Reviews Section */}
                <div>
                  <div className="border-b border-border pb-4 mb-6">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                      Reviews {totalReviews > 0 && `(${totalReviews})`}
                    </h3>
                  </div>

                  {/* Rate & Review Button */}
                  {isAuthenticated && !hasUserReviewed && (
                    <div className="mb-6">
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={() => setReviewModalOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        Rate & Review
                      </Button>
                    </div>
                  )}

                  {/* Already Reviewed Message */}
                  {isAuthenticated && hasUserReviewed && (
                    <Card className="mb-6 border-2 border-secondary/20">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-secondary">
                          <Star className="w-5 h-5 fill-secondary" />
                          <p className="font-medium">
                            You have already reviewed this experience
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Login Prompt for Writing Reviews (Unauthenticated Users) */}
                  {!isAuthenticated && (
                    <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <MessageSquare className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Login to Write a Review
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Share your experience and help others discover great experiences
                            </p>
                            <Button
                              variant="hero"
                              size="lg"
                              onClick={() => navigate("/login", { state: { from: { pathname: `/experiences/${id}` } } })}
                              className="w-full sm:w-auto"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Login to Write Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  {reviewsLoading && reviews.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                          No reviews yet. Be the first to review this experience!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <Card
                            key={review._id ?? review.id ?? Math.random()}
                            className="border-2"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold">
                                    {review.user?.name || "Anonymous"}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {renderStars(Number(review.rating) || 0)}
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(
                                        String(review.createdAt)
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-muted-foreground">
                                {String(review.review || "")}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {/* Show More Button */}
                      {totalReviews > reviews.length && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setReviewPage((prev) => prev + 1)}
                            disabled={reviewsLoading}
                            className="w-full sm:w-auto"
                          >
                            {reviewsLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                Show More ({reviews.length} of {totalReviews})
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-2 shadow-2xl">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-8 pb-6 border-b border-border">
                      <p className="text-sm text-muted-foreground mb-2 font-medium">
                        Price per person
                      </p>
                      <p className="text-4xl md:text-6xl font-bold text-primary">
                        ETB {experience.price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="mb-8">
                      <label className="text-base font-semibold mb-4 block text-foreground">Number of Guests</label>
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => {
                            const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                            const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                            setNumGuests(Math.max(1, numGuests - 1));
                          }}
                          disabled={numGuests <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 flex items-center justify-center border border-border rounded-md bg-background/50">
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, Number(experience.maxGuests) || 1)}
                            value={numGuests}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 1;
                              const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                              const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                              setNumGuests(Math.max(1, Math.min(value, maxAllowed)));
                            }}
                            className="w-full h-10 text-center text-lg font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-md bg-transparent"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => {
                            const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                            const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                            setNumGuests(Math.min(maxAllowed, numGuests + 1));
                          }}
                          disabled={(() => {
                            const maxAvailable = (availability?.available ?? Number(experience.maxGuests)) || 1;
                            const maxAllowed = Math.min(Number(experience.maxGuests) || 1, maxAvailable);
                            return numGuests >= maxAllowed;
                          })()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground">
                          Max {experience.maxGuests} guests
                        </span>
                        <Badge variant={availability && availability.available > 0 ? "secondary" : "destructive"}>
                          {availability?.available ?? experience.maxGuests} available
                        </Badge>
                      </div>
                      {availability && availability.available > 0 && (
                        <div className="w-full bg-muted rounded-full h-2 mb-4">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(availability.available / experience.maxGuests) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Total Price</span>
                          <span className="text-2xl font-bold text-primary">
                            ETB {(Number(experience.price) * (numGuests || 1)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {availability && availability.available > 0 && numGuests >= availability.available && (
                        <div className="mt-3 text-center text-sm text-amber-600 font-medium">
                          Maximum available is {availability.available}.
                        </div>
                      )}
                    </div>

                    {/* Host */}
                    {experience.host && (
                      <div className="mb-6 pb-6 border-b border-border">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          Your Host
                        </h4>
                        <Card className="border-2">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {typeof experience.host === 'object' ? (
                                <>
                                  {experience.host.photo ? (
                                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                                      <AvatarImage
                                        src={
                                          String(experience.host.photo).startsWith('/')
                                            ? `${API_ORIGIN}${experience.host.photo}`
                                            : experience.host.photo
                                        }
                                        alt={experience.host.name}
                                      />
                                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {(() => {
                                          const name = experience.host.name || experience.host.email || 'Guest';
                                          const parts = name.trim().split(/\s+/);
                                          if (parts.length >= 2) {
                                            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                          }
                                          return name.substring(0, 2).toUpperCase();
                                        })()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-primary/20">
                                      {(() => {
                                        const name = experience.host.name || experience.host.email || 'Guest';
                                        const parts = name.trim().split(/\s+/);
                                        if (parts.length >= 2) {
                                          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                        }
                                        return name.substring(0, 2).toUpperCase();
                                      })()}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold text-base mb-1">{experience.host.name}</div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      {experience.host.email}
                                    </div>
                                    {experience.host._id || experience.host.id ? (
                                      <Link
                                        to={`/hosts/${experience.host._id || experience.host.id}`}
                                        className="text-sm text-primary hover:underline font-medium"
                                      >
                                        {t("hostProfile.viewProfile")} →
                                      </Link>
                                    ) : null}
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Guide */}
                    {experience.host && typeof experience.host === 'object' && experience.host.assignedGuide && (
                      <div className="mb-6 pb-6 border-b border-border">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-secondary" />
                          Your Guide
                        </h4>
                        <Card className="border-2 border-secondary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {experience.host.assignedGuide.photo ? (
                                <Avatar className="w-16 h-16 border-2 border-secondary/30">
                                  <AvatarImage
                                    src={
                                      String(experience.host.assignedGuide.photo).startsWith('/')
                                        ? `${API_ORIGIN}${experience.host.assignedGuide.photo}`
                                        : experience.host.assignedGuide.photo
                                    }
                                    alt={experience.host.assignedGuide.name}
                                  />
                                  <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                                    {(() => {
                                      const name = experience.host.assignedGuide.name || experience.host.assignedGuide.email || 'Guide';
                                      const parts = name.trim().split(/\s+/);
                                      if (parts.length >= 2) {
                                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                      }
                                      return name.substring(0, 2).toUpperCase();
                                    })()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold border-2 border-secondary/30">
                                  {(() => {
                                    const name = experience.host.assignedGuide.name || experience.host.assignedGuide.email || 'Guide';
                                    const parts = name.trim().split(/\s+/);
                                    if (parts.length >= 2) {
                                      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                    }
                                    return name.substring(0, 2).toUpperCase();
                                  })()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-base mb-1 flex items-center gap-2">
                                  {experience.host.assignedGuide.name}
                                  {experience.host.assignedGuide.guideStatus === 'approved' && (
                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                                {experience.host.assignedGuide.location && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    {experience.host.assignedGuide.location}
                                  </div>
                                )}
                                {experience.host.assignedGuide.paymentPerHour && (
                                  <div className="text-sm font-medium text-secondary">
                                    ETB {experience.host.assignedGuide.paymentPerHour}/hour
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Map */}
                    {experience.startLocation?.coordinates && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          Location
                        </h4>
                        <Card className="border-2 overflow-hidden">
                          <iframe
                            title="location-map"
                            src={`https://www.google.com/maps?q=${experience.startLocation.coordinates[1]},${experience.startLocation.coordinates[0]}&z=12&output=embed`}
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            className="w-full"
                          />
                        </Card>
                      </div>
                    )}

                    {!isAuthenticated ? (
                      <Card className="mb-3 border-2 border-primary/20 bg-primary/5">
                        <CardContent className="p-6 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">
                                Login to Book This Experience
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Please login to book this experience and secure your spot
                              </p>
                              <Button
                                variant="hero"
                                size="lg"
                                onClick={() => navigate("/login", { state: { from: { pathname: `/experiences/${id}` } } })}
                                className="w-full"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Login to Book
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : hasBooked ? (
                      <Button
                        variant="secondary"
                        size="xl"
                        className="w-full mb-3"
                        disabled
                      >
                        <Check className="w-4 h-4 mr-2 inline-block" /> Booked
                      </Button>
                    ) : (
                      <Button
                        variant="hero"
                        size="xl"
                        className="w-full mb-3"
                        disabled={((availability?.available ?? 1) < 1) || (numGuests > (availability?.available ?? (Number(experience.maxGuests) || 1)))}
                        onClick={async () => {

                          try {
                            toast({
                              title: "Redirecting to payment...",
                              description:
                                "You will be redirected to complete payment",
                            });
                            const resp = await bookingsAPI.create(id as string, numGuests);
                            const checkoutUrl =
                              resp.checkout_url || resp.data?.checkout_url;
                            if (checkoutUrl) {
                              // redirect browser to checkout
                              // include qty in return so we can show it on MyBookings immediately if needed
                              window.location.href = checkoutUrl;
                            } else {
                              throw new Error(
                                "No checkout URL returned from server"
                              );
                            }
                          } catch (err: any) {
                            console.error("Booking init failed:", err);
                            let errorMessage = "Failed to initiate booking";
                            
                            if (err.response) {
                              // Server responded with error
                              const responseData = err.response.data;
                              
                              // Log full error for debugging
                              console.error("Full error response:", JSON.stringify({
                                status: err.response.status,
                                statusText: err.response.statusText,
                                data: responseData,
                                dataType: typeof responseData,
                                dataKeys: responseData ? Object.keys(responseData) : []
                              }, null, 2));
                              
                              // Try multiple ways to extract error message (production vs development format)
                              errorMessage = 
                                (responseData && typeof responseData === 'object' && responseData.message) ||
                                (responseData && typeof responseData === 'object' && responseData.error?.message) ||
                                (responseData && typeof responseData === 'object' && responseData.error) ||
                                (responseData && typeof responseData === 'string' ? responseData : null) ||
                                (responseData?.status === 'failed' ? responseData?.message : null) ||
                                (responseData?.status === 'error' ? responseData?.message : null) ||
                                `Request failed with status ${err.response.status}`;
                              
                              // Log the extracted error message
                              console.error("Extracted error message:", errorMessage);
                              
                              // If we still don't have a message, log the raw data
                              if (!errorMessage || errorMessage.includes('Request failed')) {
                                console.error("Could not extract error message. Raw response data:", responseData);
                              }
                            } else if (err.request) {
                              // Request made but no response
                              errorMessage = "No response from server. Please check your connection.";
                              console.error("No response received:", err.request);
                            } else {
                              // Error setting up request
                              errorMessage = err.message || errorMessage;
                            }
                            
                            toast({
                              title: "Booking Error",
                              description: errorMessage,
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Join Experience
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        const experienceTitle = experience?.title ? String(experience.title) : "";
                        navigate(
                          `/contact?experience=${id ?? ""}&name=${encodeURIComponent(
                            experienceTitle
                          )}`
                        );
                      }}
                    >
                      Contact Us
                    </Button>

                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Experiences hosted in local homes across Ethiopia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-none">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {experience.images && experience.images.length > 0 && (
              <>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-8 h-8" />
                </button>
                {experience.images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? experience.images.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-4 z-50 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) =>
                          prev === experience.images.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-4 z-50 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
                <img
                  src={
                    experience.images[selectedImageIndex] &&
                    String(experience.images[selectedImageIndex]).startsWith("/")
                      ? `${API_ORIGIN}${experience.images[selectedImageIndex]}`
                      : experience.images[selectedImageIndex] ||
                        `https://placehold.co/800x600/2d5a3d/ffd700?text=Image+${
                          selectedImageIndex + 1
                        }`
                  }
                  alt={`${experience.title} ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                {experience.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                    {selectedImageIndex + 1} / {experience.images.length}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience and help others discover this amazing adventure
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Your Rating</label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 cursor-pointer transition-all ${
                      i < newRating
                        ? "text-secondary fill-secondary scale-110"
                        : "text-muted hover:text-secondary/50"
                    }`}
                    onClick={() => setNewRating(i + 1)}
                  />
                ))}
              </div>
              {newRating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {newRating === 1 && "Poor"}
                  {newRating === 2 && "Fair"}
                  {newRating === 3 && "Good"}
                  {newRating === 4 && "Very Good"}
                  {newRating === 5 && "Excellent"}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Tell us about your experience... What did you enjoy? What could be improved?"
                className="min-h-[150px]"
                rows={6}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewModalOpen(false);
                  setNewReview("");
                  setNewRating(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || !newReview || newRating === 0}
                variant="hero"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default TourDetail;
