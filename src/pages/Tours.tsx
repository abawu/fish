import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import { Loader2, AlertCircle } from "lucide-react";
import { experiencesAPI } from "@/lib/api";
import { motion } from "framer-motion";

const Tours = () => {
  const [sort, setSort] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(9);
  const [experiences, setExperiences] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = {};
        if (sort) params.sort = sort;
        params.page = page;
        params.limit = limit;
        const response = await experiencesAPI.getAll(params);
        setExperiences(response.data.data);
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
  }, [sort, page, limit]);

  // Experiences are already filtered in useEffect
  const filteredExperiences = experiences;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Header */}
        <section className="relative bg-gradient-to-br from-primary via-primary-light to-earth py-24 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 pattern-ethiopian" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                Discover Authentic{" "}
                <span className="text-secondary">Home Experiences</span>
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Browse our carefully curated collection of immersive experiences hosted by local families. 
                From traditional coffee ceremonies to hands-on cooking workshops, discover authentic cultural connections.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Experiences Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-secondary/10 border border-secondary rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-sm text-foreground">{error}</p>
              </motion.div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredExperiences.length}
                </span>{" "}
                experience
                {filteredExperiences.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-2 py-1 border"
                >
                  <option value="">Sort</option>
                  <option value="-ratingsAverage,price">Top rated</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-createdAt">Newest</option>
                </select>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-2 py-1 border"
                >
                  <option value={6}>6 / page</option>
                  <option value={9}>9 / page</option>
                  <option value={12}>12 / page</option>
                  <option value={24}>24 / page</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredExperiences.map((experience) => (
                    <TourCard key={experience._id ?? experience.id} tour={experience} />
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="px-3 py-1 border"
                  >
                    Prev
                  </button>
                  <span>Page {page}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border"
                  >
                    Next
                  </button>
                </div>

                {filteredExperiences.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">
                      No experiences found.
                    </p>
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
