import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { bookingsAPI, type BookingRecord, API_ORIGIN } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, UserCheck, Phone, Mail } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl font-bold mb-6">
              My Bookings
            </h1>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-6 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">
                  You have no bookings yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map(b => {
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
                  
                  // Extract guide information
                  const guide = typeof b.guide === 'object' && b.guide !== null ? b.guide : null;
                  const requiresGuide = b.requiresGuide === true;
                  const guideCost = b.guideCost || 0;
                  const experienceCost = total - guideCost;
                  
                  return (
                    <Card
                      key={b._id || b.id}
                      className="border-0 shadow-sm rounded-lg overflow-hidden"
                    >
                      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">
                            {title}
                          </h3>

                          <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                              <span>
                                Booked on{' '}
                                {b.createdAt
                                  ? new Date(b.createdAt).toLocaleString()
                                  : 'Unknown'}
                              </span>
                              <span className="mt-1 sm:mt-0">
                                Guests:{' '}
                                <span className="text-foreground font-medium">{qty}</span>
                              </span>
                              <span className="mt-1 sm:mt-0">
                                Per person:{' '}
                                <span className="text-foreground font-medium">ETB {experienceCost > 0 ? Math.round((experienceCost / qty) * 100) / 100 : per}</span>
                              </span>
                            </div>
                            <div className="grid gap-1 text-muted-foreground">
                              <p>
                                <span className="text-foreground font-medium">Experience:</span>{' '}
                                {experienceInfo}
                              </p>
                              <p>
                                <span className="text-foreground font-medium">Booking window:</span>{' '}
                                {expirationInfo}
                              </p>
                            </div>
                            
                            {/* Guide Information */}
                            {requiresGuide && guide && (
                              <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <UserCheck className="w-4 h-4 text-primary" />
                                  <span className="text-foreground font-medium">Guide Assigned</span>
                                </div>
                                <div className="flex items-start gap-3">
                                  {guide.photo ? (
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage
                                        src={
                                          String(guide.photo).startsWith('/')
                                            ? `${API_ORIGIN}${guide.photo}`
                                            : guide.photo
                                        }
                                        alt={guide.name || 'Guide'}
                                      />
                                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                        {(() => {
                                          const name = guide.name || 'Guide';
                                          const parts = name.trim().split(/\s+/);
                                          if (parts.length >= 2) {
                                            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                          }
                                          return name.substring(0, 2).toUpperCase();
                                        })()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                      {(() => {
                                        const name = guide.name || 'Guide';
                                        const parts = name.trim().split(/\s+/);
                                        if (parts.length >= 2) {
                                          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                        }
                                        return name.substring(0, 2).toUpperCase();
                                      })()}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold text-sm text-foreground">{guide.name || 'Professional Guide'}</div>
                                    {guide.email && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Mail className="w-3 h-3" />
                                        <a href={`mailto:${guide.email}`} className="hover:text-primary">
                                          {guide.email}
                                        </a>
                                      </div>
                                    )}
                                    {(() => {
                                      const guidePhone = guide.phone || 
                                                        guide.guideApplicationData?.phoneNumber || 
                                                        null;
                                      return guidePhone ? (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                          <Phone className="w-3 h-3" />
                                          <a href={`tel:${guidePhone}`} className="hover:text-primary">
                                            {guidePhone}
                                          </a>
                                        </div>
                                      ) : null;
                                    })()}
                                    {guideCost > 0 && (
                                      <div className="mt-2 pt-2 border-t border-primary/10">
                                        <div className="text-xs text-muted-foreground">
                                          Guide Service: <span className="font-semibold text-foreground">ETB {guideCost.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {statusMeta.helper && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              {statusMeta.helper}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 items-end mt-3 md:mt-0">
                          <div className="flex flex-wrap gap-2 justify-end">
                          <div
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: statusMeta.bg,
                              color: statusMeta.color
                            }}
                          >
                            {statusMeta.label}
                          </div>
                            <div
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: b.paid
                                  ? 'rgba(16,185,129,0.12)'
                                  : 'rgba(220,38,38,0.08)',
                                color: b.paid ? '#10B981' : '#DC2626'
                              }}
                            >
                              {b.paid ? 'Paid' : 'Payment pending'}
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {guideCost > 0 && (
                              <div className="mb-2 text-right">
                                <div className="text-xs">Experience: ETB {experienceCost.toFixed(2)}</div>
                                <div className="text-xs">Guide: ETB {guideCost.toFixed(2)}</div>
                              </div>
                            )}
                            <span className="block">Total</span>
                            <span className="font-semibold text-foreground">
                              ETB {total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
