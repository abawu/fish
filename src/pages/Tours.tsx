import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import PageHeader from "@/components/PageHeader";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Search, X, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { experiencesAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const Tours = () => {
  const [sort, setSort] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const limit = 8; // Fixed limit - 8 per page
  const [experiences, setExperiences] = useState<Array<Record<string, unknown>>>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = {};
        if (sort) params.sort = sort;
        if (searchQuery) params.search = searchQuery;
        params.page = page;
        params.limit = limit;
        const response = await experiencesAPI.getAll(params);
        const experiencesData = response.data.data || response.data || [];
        setExperiences(experiencesData);
        // Calculate total pages - check various possible response structures
        const total = response.data.total || 
                     response.data.totalDocs || 
                     response.data.count ||
                     (experiencesData.length < limit ? experiencesData.length : experiencesData.length + 1);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } catch (err: any) {
        console.error("Failed to fetch experiences:", err);
        let errorMessage = "Failed to load experiences from server. Please try again later.";
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || !err.response) {
          errorMessage = "Cannot connect to server. Please check if the backend is running.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setExperiences([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [sort, page, searchQuery]);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sort]);

  // Filter experiences client-side if needed (for additional filtering)
  const filteredExperiences = useMemo(() => {
    if (!searchQuery) return experiences;
    const query = searchQuery.toLowerCase();
    return experiences.filter((exp: any) => 
      exp.title?.toLowerCase().includes(query) ||
      exp.summary?.toLowerCase().includes(query) ||
      exp.description?.toLowerCase().includes(query) ||
      exp.location?.toLowerCase().includes(query)
    );
  }, [experiences, searchQuery]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="overflow-hidden border border-border/50">
      <div className="h-48 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-6 bg-muted rounded animate-pulse w-1/3 mt-4" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Header */}
        <PageHeader
          title={
            <>
              Discover Authentic{" "}
              <span className="text-primary">Home Experiences</span>
            </>
          }
          description="Browse our carefully curated collection of immersive experiences hosted by local families. From traditional coffee ceremonies to hands-on cooking workshops, discover authentic cultural connections."
        />

        {/* Experiences Grid */}
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            {/* Search and Filters Bar */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search experiences by title, location, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filters and Sort Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters:
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {sort && sort !== "default" && (
                    <Badge variant="secondary" className="gap-1">
                      Sorted
                      <button
                        onClick={() => setSort("")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="sort" className="text-sm text-muted-foreground whitespace-nowrap">
                    Sort by:
                  </label>
                  <Select value={sort || "default"} onValueChange={(value) => setSort(value === "default" ? "" : value)}>
                    <SelectTrigger id="sort" className="w-[180px]">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="-ratingsAverage,price">Top Rated</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="-price">Price: High to Low</SelectItem>
                      <SelectItem value="-createdAt">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filteredExperiences.length}
                  </span>{" "}
                  experience
                  {filteredExperiences.length !== 1 ? "s" : ""}
                  {totalPages > 1 && (
                    <>{" "}on page <span className="font-semibold text-foreground">{page}</span> of {totalPages}</>
                  )}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-foreground">{error}</p>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: limit }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Experiences Grid */}
                <AnimatePresence mode="wait">
                  {filteredExperiences.length > 0 ? (
                    <motion.div
                      key="experiences-grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                      {filteredExperiences.map((experience, index) => (
                        <motion.div
                          key={experience._id ?? experience.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TourCard tour={experience} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-20"
                    >
                      <Card className="border-2 border-dashed max-w-md mx-auto">
                        <CardContent className="p-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">No experiences found</h3>
                              <p className="text-muted-foreground mb-4">
                                {searchQuery
                                  ? `We couldn't find any experiences matching "${searchQuery}". Try adjusting your search.`
                                  : "No experiences are available at the moment. Check back later!"}
                              </p>
                              {searchQuery && (
                                <Button
                                  variant="outline"
                                  onClick={() => setSearchQuery("")}
                                  className="gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Clear search
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination - Show if we have experiences or if there might be more pages */}
                {filteredExperiences.length > 0 && totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1 || isLoading}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (page <= 4) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = page - 3 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              disabled={isLoading}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages || isLoading}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Tours;
