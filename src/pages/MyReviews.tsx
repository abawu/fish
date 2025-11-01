import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Star,
  Loader2,
  AlertCircle,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { reviewsAPI, experiencesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MyReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReview, setEditReview] = useState("");
  const [editRating, setEditRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      if (!user) {
        setReviews([]);
        return;
      }
      const response = await reviewsAPI.getAll();
      // Normalize possible response shapes:
      // - { status, results, data: { data: [...] } }
      // - { data: [...] }
      // - [...] (unlikely)
      const docs =
        response?.data?.data ?? // typical handlerFactory shape
        response?.data ?? // some helpers return { data: [...] }
        response ??
        [];
      const arr = Array.isArray(docs) ? docs : [];
      // If user is admin, show all reviews. Otherwise filter by current user id.
      let target = arr;
      if (user?.role !== "admin") {
        const currentUserId = (user as any)?._id ?? (user as any)?.id;
        target = arr.filter((r: any) => {
          const rid = r.user?._id ?? r.user?.id ?? r.user;
          return String(rid) === String(currentUserId);
        });
      }

      // Enrich reviews to ensure experience has a real title
      const enriched = await Promise.all(
        target.map(async (r: any) => {
          const t = r.experience;
          // If populated with title, keep as is
          if (t && typeof t === 'object' && t.title) return r;
          const experienceId = typeof t === 'string' ? t : (t?._id ?? t?.id);
          if (!experienceId) return r;
          try {
            const tr = await experiencesAPI.getById(String(experienceId));
            return { ...r, experience: tr.data.data };
          } catch {
            return r;
          }
        })
      );

      setReviews(enriched);
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);
      setError(err.response?.data?.message || "Failed to load reviews");
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    try {
      await reviewsAPI.delete(id);
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      setReviews(reviews.filter((review) => (review._id ?? review.id) !== id));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete review",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handleEdit = (review: any) => {
    const rid = (review._id ?? review.id) as string;
    setEditingId(rid);
    setEditReview(review.review);
    setEditRating(review.rating);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editReview || editRating === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in review and rating",
        variant: "destructive",
      });
      return;
    }

    try {
      await reviewsAPI.update(editingId, {
        review: editReview,
        rating: editRating,
      });
      toast({
        title: "Success",
        description: "Review updated successfully",
      });
      setReviews(
        reviews.map((review) =>
          (review._id ?? review.id) === editingId
            ? { ...review, review: editReview, rating: editRating }
            : review
        )
      );
      setEditingId(null);
      setEditReview("");
      setEditRating(0);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditReview("");
    setEditRating(0);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-secondary fill-secondary" : "text-muted"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <section className="relative bg-gradient-to-br from-primary via-primary-light to-earth py-24 text-primary-foreground">
          <div className="absolute inset-0 pattern-ethiopian opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl md:text-6xl font-bold text-center"
            >
              {user?.role === "admin" ? "All Reviews" : "My Reviews"}
            </motion.h1>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {isLoading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card className="border-2 border-destructive">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="w-6 h-6" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <p className="text-xl text-muted-foreground mb-6">
                  You haven't written any reviews yet.
                </p>
                <Button variant="adventure" onClick={() => navigate("/tours")}>
                  Browse Tours
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => {
                  const rid = review._id ?? review.id;
                  return (
                    <motion.div
                      key={rid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 hover:border-primary/20 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-2xl mb-2">
                                {review.tour?.name || "Tour Name"}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {editingId !== rid && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(review)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDeleteId(rid)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {editingId === rid ? (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Rating
                                </label>
                                <div className="flex gap-1 mt-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 cursor-pointer ${
                                        i < editRating
                                          ? "text-secondary fill-secondary"
                                          : "text-muted"
                                      }`}
                                      onClick={() => setEditRating(i + 1)}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Review
                                </label>
                                <Textarea
                                  value={editReview}
                                  onChange={(e) =>
                                    setEditReview(e.target.value)
                                  }
                                  placeholder="Write your review..."
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveEdit}>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-muted-foreground mb-4">
                                {review.review}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default MyReviews;
