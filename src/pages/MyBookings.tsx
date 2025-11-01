import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { bookingsAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyBookings = () => {
  type Booking = {
    _id?: string;
    id?: string;
    tour?: { name?: string } | string | null;
    price?: number;
    paid?: boolean;
    status?: string;
    createdAt?: string;
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
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
      // backend returns: { status, results, data: [bookings] }
      // bookingsAPI returns response.data, so resp is that object.
      let bookingsList: Booking[] = [];
      if (Array.isArray(resp)) bookingsList = resp as Booking[];
      else if (Array.isArray((resp as any).data))
        bookingsList = (resp as any).data;
      else if (Array.isArray((resp as any).data?.data))
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
                {bookings.map(b => (
                  <Card
                    key={b._id || b.id}
                    className="border-0 shadow-sm rounded-lg overflow-hidden"
                  >
                    <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">
                          {typeof b.tour === 'string'
                            ? b.tour
                            : b.tour?.name || 'Tour'}
                        </h3>

                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-muted-foreground">
                          <span>
                            Booked on:{' '}
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleString()
                              : 'Unknown'}
                          </span>
                          <span className="mt-1 sm:mt-0">
                            Price:{' '}
                            <span className="font-medium text-foreground">
                              ETB {b.price ?? '—'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 md:mt-0">
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: b.paid
                              ? 'rgba(16,185,129,0.12)'
                              : 'rgba(220,38,38,0.08)',
                            color: b.paid ? '#10B981' : '#DC2626'
                          }}
                        >
                          {b.paid ? 'Paid' : b.status || 'Pending'}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <span className="block">Total</span>
                          <span className="font-semibold text-foreground">
                            ETB {b.price ?? '—'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
