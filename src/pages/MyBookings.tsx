import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { bookingsAPI, type BookingRecord, API_ORIGIN } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Users, DollarSign, Clock, CheckCircle, XCircle, ExternalLink, MapPin, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; color: string; helper?: string }
> = {
  upcoming: {
    label: 'Upcoming',
    bg: 'rgba(59,130,246,0.12)',
    color: '#1D4ED8',
    helper: 'We will keep this booking active until the experience date.'
  },
  active: {
    label: 'Upcoming',
    bg: 'rgba(59,130,246,0.12)',
    color: '#1D4ED8',
    helper: 'We will keep this booking active until the experience date.'
  },
  completed: {
    label: 'Completed',
    bg: 'rgba(16,185,129,0.12)',
    color: '#0F9D58',
    helper: 'Experience finished. Hosts are reminded to repost or schedule the next date.'
  },
  expired: {
    label: 'Expired',
    bg: 'rgba(148,163,184,0.25)',
    color: '#475569',
    helper: 'This booking has been archived because its expiration window passed.'
  }
};

const describeRelativeDifference = (target: Date, base: Date) => {
  const diffMs = target.getTime() - base.getTime();
  const absMs = Math.abs(diffMs);
  const absHours = Math.round(absMs / (60 * 60 * 1000));

  if (absHours < 24) {
    if (absHours === 0) {
      return diffMs >= 0 ? 'in less than an hour' : 'less than an hour ago';
    }
    return diffMs >= 0
      ? `in ${absHours} hour${absHours === 1 ? '' : 's'}`
      : `${absHours} hour${absHours === 1 ? '' : 's'} ago`;
  }

  const absDays = Math.round(absHours / 24);
  return diffMs >= 0
    ? `in ${absDays} day${absDays === 1 ? '' : 's'}`
    : `${absDays} day${absDays === 1 ? '' : 's'} ago`;
};

const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract booking fetch into a reusable function
  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await bookingsAPI.getMyBookings();
      // Handle the canonical API response but keep backward compatibility with earlier shapes.
      let bookingsList: BookingRecord[] = [];
      if (Array.isArray(resp?.data)) bookingsList = resp.data;
      else if (Array.isArray(resp as unknown as BookingRecord[]))
        bookingsList = resp as unknown as BookingRecord[];
      else if (Array.isArray((resp as any)?.data?.data))
        bookingsList = (resp as any).data.data;
      setBookings(bookingsList);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      let message = 'Failed to load bookings';
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        if (e?.response?.data?.message)
          message = String(e.response.data.message);
        else if (e?.message) message = String(e.message);
      } catch (e) {
        // ignore
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If Chapa redirected back with tx_ref, call verify first
    const params = new URLSearchParams(location.search);
    const txRef =
      params.get('tx_ref') ||
      params.get('txref') ||
      params.get('txRef') ||
      params.get('reference');

    const doVerifyAndFetch = async () => {
      if (txRef) {
        // show a verifying toast
        toast({
          title: 'Verifying payment',
          description: 'Please wait while we confirm your payment.'
        });
        try {
          const resp = await bookingsAPI.verify(txRef);
          // Show success message if booking created; support multiple response shapes
          const msg =
            resp?.message ||
            resp?.booking?.message ||
            resp?.data?.message ||
            (resp?.raw && resp.raw.message) ||
            'Payment verified';
          toast({ title: 'Payment verified', description: String(msg) });
        } catch (err) {
          console.error('Payment verify failed:', err);
          let message = 'Payment verification failed';
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const e = err as any;
            if (e?.response?.data?.message)
              message = String(e.response.data.message);
            else if (e?.message) message = String(e.message);
          } catch (e) {
            // ignore parsing errors
            // console.debug('verify error parse', e);
          }
          toast({
            title: 'Verification failed',
            description: message,
            variant: 'destructive'
          });
        } finally {
          // Remove query params to avoid re-verification on reload
          navigate(
            { pathname: location.pathname, search: '' },
            { replace: true }
          );
        }
      }

      // Always fetch bookings after any potential verify
      await fetchBookings();
    };

    doVerifyAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => {
      const status = (b.status || 'upcoming').toLowerCase();
      return status === statusFilter;
    });
  }, [bookings, statusFilter]);

  // Group bookings by status for stats
  const bookingStats = useMemo(() => {
    const stats = {
      all: bookings.length,
      upcoming: 0,
      active: 0,
      completed: 0,
      expired: 0,
    };
    bookings.forEach(b => {
      const status = (b.status || 'upcoming').toLowerCase();
      if (status === 'upcoming' || status === 'active') {
        stats.upcoming++;
        stats.active++;
      } else if (status === 'completed') {
        stats.completed++;
      } else if (status === 'expired') {
        stats.expired++;
      }
    });
    return stats;
  }, [bookings]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="border-2 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
          <div className="flex flex-col gap-3 items-end">
            <div className="h-6 bg-muted rounded-full animate-pulse w-20" />
            <div className="h-8 bg-muted rounded animate-pulse w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <PageHeader
          title="My Bookings"
          description="View and manage all your experience bookings"
        />

        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            {/* Stats Cards */}
            {!isLoading && bookings.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{bookingStats.all}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total</div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{bookingStats.upcoming}</div>
                    <div className="text-sm text-muted-foreground mt-1">Upcoming</div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{bookingStats.completed}</div>
                    <div className="text-sm text-muted-foreground mt-1">Completed</div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-500">{bookingStats.expired}</div>
                    <div className="text-sm text-muted-foreground mt-1">Expired</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Filter Tabs */}
            {!isLoading && bookings.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({bookingStats.all})
                </Button>
                <Button
                  variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('upcoming')}
                >
                  Upcoming ({bookingStats.upcoming})
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed ({bookingStats.completed})
                </Button>
                <Button
                  variant={statusFilter === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('expired')}
                >
                  Expired ({bookingStats.expired})
                </Button>
              </div>
            )}

            {/* Error State */}
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
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Card className="border-2 border-dashed max-w-md mx-auto">
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {bookings.length === 0 ? 'No bookings yet' : 'No bookings match this filter'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {bookings.length === 0
                            ? "Start exploring amazing experiences and book your first adventure!"
                            : `Try selecting a different status filter.`}
                        </p>
                        {bookings.length === 0 && (
                          <Button asChild variant="hero">
                            <Link to="/experiences">
                              Browse Experiences
                            </Link>
                          </Button>
                        )}
                        {bookings.length > 0 && (
                          <Button variant="outline" onClick={() => setStatusFilter('all')}>
                            Show All Bookings
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={statusFilter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {filteredBookings.map((b, index) => {
                  const now = new Date();
                  const experienceDate = b.experienceDate ? new Date(b.experienceDate) : undefined;
                  const expiresAt = b.expiresAt ? new Date(b.expiresAt) : undefined;
                  const experienceVerb = experienceDate
                    ? experienceDate > now
                      ? 'Scheduled'
                      : 'Occurred'
                    : 'Scheduled';
                  const experienceInfo = experienceDate
                    ? `${experienceVerb} ${experienceDate.toLocaleString()} (${describeRelativeDifference(
                        experienceDate,
                        now
                      )})`
                    : 'Experience date pending';
                  const expirationVerb = expiresAt && expiresAt <= now ? 'Expired' : 'Expires';
                  const expirationInfo = expiresAt
                    ? `${expirationVerb} ${expiresAt.toLocaleString()} (${describeRelativeDifference(
                        expiresAt,
                        now
                      )})`
                    : 'No expiration set';
                  const statusKey = (b.status || 'upcoming').toLowerCase();
                  const statusMeta = STATUS_STYLES[statusKey] || STATUS_STYLES.upcoming;
                  const title = typeof b.experience === 'object'
                    ? (b.experience?.title || 'Experience')
                    : (typeof b.tour === 'object' ? b.tour?.name : (b.tour as string)) || 'Experience';
                    const qty = b.quantity || 1;
                    const total = b.price || 0;
                    const per = qty > 0 ? Math.round((total / qty) * 100) / 100 : total;
                    const experienceId = typeof b.experience === 'object' 
                      ? ((b.experience as any)?._id ?? (b.experience as any)?.id)
                      : b.experience;
                    const experienceImage = typeof b.experience === 'object' 
                      ? ((b.experience as any)?.imageCover as string)
                      : null;

                    return (
                      <motion.div
                        key={b._id || b.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              {/* Experience Image */}
                              {experienceImage && (
                                <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                                  <img
                                    src={
                                      String(experienceImage).startsWith('/')
                                        ? `${API_ORIGIN}${experienceImage}`
                                        : experienceImage
                                    }
                                    alt={title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                              )}
                              
                              {/* Booking Details */}
                              <div className="flex-1 p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                  <div className="flex-1 space-y-4">
                                    {/* Title and Link */}
                                    <div>
                                      <h3 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                                        {title}
                                        {experienceId && (
                                          <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2"
                                          >
                                            <Link to={`/experiences/${experienceId}`}>
                                              <ExternalLink className="w-3 h-3" />
                                            </Link>
                                          </Button>
                                        )}
                                      </h3>
                                    </div>

                                    {/* Booking Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Booked On</p>
                                          <p className="text-sm text-muted-foreground">
                                            {b.createdAt
                                              ? new Date(b.createdAt).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })
                                              : 'Unknown'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Guests</p>
                                          <p className="text-sm text-muted-foreground">
                                            {qty} {qty === 1 ? 'guest' : 'guests'} · ETB {per.toLocaleString()}/person
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Experience Date</p>
                                          <p className="text-sm text-muted-foreground">{experienceInfo}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Expires</p>
                                          <p className="text-sm text-muted-foreground">{expirationInfo}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Helper Text */}
                                    {statusMeta.helper && (
                                      <div className="pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground italic">
                                          {statusMeta.helper}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Status and Price */}
                                  <div className="flex flex-col gap-4 md:items-end">
                                    <div className="flex flex-wrap gap-2 justify-end">
                                      <Badge
                                        className="text-sm font-medium"
                                        style={{
                                          backgroundColor: statusMeta.bg,
                                          color: statusMeta.color
                                        }}
                                      >
                                        {statusMeta.label}
                                      </Badge>
                                      <Badge
                                        variant={b.paid ? 'default' : 'destructive'}
                                        className="text-sm font-medium"
                                      >
                                        {b.paid ? (
                                          <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Paid
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Pending
                                          </>
                                        )}
                                      </Badge>
                                    </div>

                                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 min-w-[140px]">
                                      <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        <span className="text-xs text-muted-foreground">Total Amount</span>
                                      </div>
                                      <div className="text-2xl font-bold text-primary">
                                        ETB {total.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
