import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Briefcase,
} from "lucide-react";
import { guidesAPI, experiencesAPI, bookingsAPI, type BookingRecord } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function GuideDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hosts, setHosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hostExperiences, setHostExperiences] = useState<Record<string, any[]>>({});
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const guideStatus = (user as any)?.guideStatus;
    if (guideStatus !== "approved") {
      navigate("/profile");
      toast({
        title: "Access Denied",
        description: "You must be an approved guide to access this page.",
        variant: "destructive",
      });
      return;
    }

    fetchAssignedHosts();
    fetchGuideBookings();
  }, [user, isAuthenticated, navigate, toast]);

  const fetchGuideBookings = async () => {
    try {
      setBookingsLoading(true);
      const resp = await bookingsAPI.getGuideBookings();
      
      // Debug logging
      console.log('Guide bookings response:', resp);
      
      // Handle different response structures
      let bookingsList: BookingRecord[] = [];
      if (Array.isArray(resp?.data)) {
        bookingsList = resp.data;
      } else if (Array.isArray((resp as any)?.data?.data)) {
        bookingsList = (resp as any).data.data;
      } else if (Array.isArray(resp)) {
        bookingsList = resp;
      }
      
      console.log('Parsed bookings list:', bookingsList);
      console.log('Number of bookings:', bookingsList.length);
      
      if (bookingsList.length > 0) {
        console.log('First booking:', bookingsList[0]);
        console.log('First booking user:', bookingsList[0].user);
      }
      
      setBookings(bookingsList);
    } catch (err: any) {
      console.error("Failed to fetch guide bookings:", err);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchAssignedHosts = async () => {
    try {
      setIsLoading(true);
      const guideId = (user as any)?._id || user?.id;
      if (!guideId) {
        toast({
          title: "Error",
          description: "Unable to identify guide",
          variant: "destructive",
        });
        return;
      }

      const response = await guidesAPI.getAssignedHosts(guideId);
      const hostsData = response.data.hosts || [];
      setHosts(hostsData);

      // Fetch experiences for each host
      const experiencesMap: Record<string, any[]> = {};
      for (const host of hostsData) {
        try {
          const hostId = host._id || host.id;
          const expResponse = await experiencesAPI.getAll({ host: hostId });
          experiencesMap[hostId] = expResponse.data.data || [];
        } catch (err) {
          console.error(`Failed to fetch experiences for host ${host._id}:`, err);
          experiencesMap[host._id || host.id] = [];
        }
      }
      setHostExperiences(experiencesMap);
    } catch (err: any) {
      console.error("Failed to fetch assigned hosts:", err);
      toast({
        title: "Error",
        description: "Failed to load assigned hosts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Header */}
        <PageHeader
          title={
            <>
              <User className="w-10 h-10 inline-block mr-3 text-primary" />
              Guide Dashboard
            </>
          }
          description="View and manage your assigned hosts"
        />

        {/* Bookings Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">My Bookings ({bookings.length})</h2>
              <p className="text-muted-foreground">
                Bookings where you are assigned as a guide - contact your guests here
              </p>
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground">
                    You don't have any bookings assigned to you yet. Bookings will appear here when guests book experiences with you as their guide.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => {
                  const guest = typeof booking.user === 'object' && booking.user !== null ? booking.user : null;
                  const experience = typeof booking.experience === 'object' && booking.experience !== null ? booking.experience : null;
                  const experienceDate = booking.experienceDate ? new Date(booking.experienceDate) : null;
                  const guideCost = booking.guideCost || 0;
                  
                  return (
                    <Card key={booking._id || booking.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          {/* Guest Information */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              {guest?.photo ? (
                                <Avatar className="w-16 h-16">
                                  <AvatarImage
                                    src={guest.photo}
                                    alt={guest.name || 'Guest'}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {(() => {
                                      const name = guest.name || 'Guest';
                                      const parts = name.trim().split(/\s+/);
                                      if (parts.length >= 2) {
                                        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                      }
                                      return name.substring(0, 2).toUpperCase();
                                    })()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                                  {(() => {
                                    const name = guest?.name || 'Guest';
                                    const parts = name.trim().split(/\s+/);
                                    if (parts.length >= 2) {
                                      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                                    }
                                    return name.substring(0, 2).toUpperCase();
                                  })()}
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">
                                  {guest?.name || 'Guest (Information Loading...)'}
                                </h3>
                                {guest ? (
                                  <div className="space-y-2 text-sm">
                                    {guest.email ? (
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <a href={`mailto:${guest.email}`} className="text-primary hover:underline">
                                          {guest.email}
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span>Email not available</span>
                                      </div>
                                    )}
                                    {(() => {
                                      const guestPhone = guest.phone || 
                                                        guest.hostApplicationData?.phoneNumber || 
                                                        guest.guideApplicationData?.phoneNumber || 
                                                        null;
                                      return guestPhone ? (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-muted-foreground" />
                                          <a href={`tel:${guestPhone}`} className="text-primary hover:underline">
                                            {guestPhone}
                                          </a>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Phone className="w-4 h-4" />
                                          <span>Phone not available</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    <p>Guest information is being loaded...</p>
                                    <p className="text-xs mt-1">Booking ID: {booking._id || booking.id}</p>
                                    <p className="text-xs">User field: {typeof booking.user}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Experience Details */}
                            {experience && (
                              <div className="mt-4 p-4 bg-muted/50 rounded-md">
                                <h4 className="font-semibold mb-2">{experience.title || 'Experience'}</h4>
                                {experienceDate && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Experience Date: {experienceDate.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  <span>Guests: {booking.quantity || 1}</span>
                                  {guideCost > 0 && (
                                    <span className="ml-4">Guide Service: ETB {guideCost.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Booking Status */}
                          <div className="flex flex-col items-end gap-2">
                            <Badge 
                              variant="outline" 
                              className={
                                booking.status === 'completed' 
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : booking.status === 'expired'
                                  ? 'bg-gray-50 text-gray-700 border-gray-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }
                            >
                              {booking.status || 'upcoming'}
                            </Badge>
                            {booking.paid && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Paid
                              </Badge>
                            )}
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

        {/* Hosts List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {hosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Assigned Hosts</h3>
                  <p className="text-muted-foreground">
                    You don't have any hosts assigned to you yet. Hosts will appear here once they are assigned by an admin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Assigned Hosts ({hosts.length})</h2>
                  <p className="text-muted-foreground">
                    Contact information and details for all hosts assigned to you
                  </p>
                </div>

                {hosts.map((host) => {
                  const hostId = host._id || host.id;
                  const experiences = hostExperiences[hostId] || [];
                  const personalInfo =
                    host.hostApplicationData?.personalInfo ||
                    host.hostApplicationData ||
                    {};
                  const phoneNumber =
                    personalInfo.phoneNumber ||
                    host.hostApplicationData?.phoneNumber ||
                    host.phoneNumber;
                  const email =
                    personalInfo.email ||
                    host.hostApplicationData?.email ||
                    host.email;
                  const cityRegion =
                    personalInfo.cityRegion ||
                    host.hostApplicationData?.cityRegion;
                  const fullAddress =
                    personalInfo.fullAddress ||
                    host.hostApplicationData?.fullAddress;
                  const languages =
                    personalInfo.languagesSpoken ||
                    host.hostApplicationData?.languagesSpoken ||
                    [];
                  const about =
                    personalInfo.aboutYou ||
                    host.hostApplicationData?.aboutYou;

                  return (
                    <motion.div
                      key={hostId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                              <User className="w-6 h-6" />
                              {host.name || host.hostApplicationData?.fullName || "Unknown Host"}
                            </CardTitle>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {experiences.length} Experience{experiences.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Contact Information */}
                            <div>
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contact Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">Email:</span>
                                  {email ? (
                                    <a
                                      href={`mailto:${email}`}
                                      className="text-primary hover:underline"
                                    >
                                      {email}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground">Not provided</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">Phone:</span>
                                  {phoneNumber ? (
                                    <a
                                      href={`tel:${phoneNumber}`}
                                      className="text-primary hover:underline"
                                    >
                                      {phoneNumber}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground">Not provided</span>
                                  )}
                                </div>
                                {cityRegion && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Location:</span>
                                    <span>{cityRegion}</span>
                                  </div>
                                )}
                                {fullAddress && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Address:</span>
                                    <span>{fullAddress}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Languages */}
                            {Array.isArray(languages) && languages.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2 text-sm">Languages Spoken:</h3>
                                <div className="flex flex-wrap gap-2">
                                  {languages.map((lang: string, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {lang}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* About */}
                            {about && (
                              <div>
                                <h3 className="font-semibold mb-2 text-sm">About:</h3>
                                <p className="text-sm text-muted-foreground">
                                  {about}
                                </p>
                              </div>
                            )}

                            {/* Experiences */}
                            {experiences.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <Briefcase className="w-4 h-4" />
                                  Experiences ({experiences.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {experiences.map((exp: any) => {
                                    const meetingPoint =
                                      exp.startLocation?.description ||
                                      exp.startLocation?.address ||
                                      exp.address ||
                                      "Not specified";
                                    const nextStartDate =
                                      Array.isArray(exp.startDates) && exp.startDates.length > 0
                                        ? new Date(exp.startDates[0]).toLocaleDateString()
                                        : null;
                                    return (
                                      <Card key={exp._id || exp.id} className="bg-muted/50">
                                        <CardContent className="p-4 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">{exp.title}</h4>
                                            <Badge variant="outline">{exp.status || "active"}</Badge>
                                          </div>
                                          <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                              <strong>Location:</strong> {exp.location || exp.city || "Location pending"}
                                            </p>
                                            <p>
                                              <strong>Meeting Point:</strong> {meetingPoint}
                                            </p>
                                            <p>
                                              <strong>Duration:</strong>{" "}
                                              {exp.duration
                                                ? `${exp.duration} day${exp.duration > 1 ? "s" : ""}`
                                                : "Flexible"}
                                            </p>
                                            {nextStartDate && (
                                              <p>
                                                <strong>Next Tour Date:</strong> {nextStartDate}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between text-sm border-t pt-2">
                                            <span className="font-medium text-primary">
                                              ETB {exp.price}
                                            </span>
                                            <span className="text-muted-foreground">
                                              {exp.ratingsAverage?.toFixed(1) || "0.0"} (
                                              {exp.ratingsQuantity || 0})
                                            </span>
                                          </div>
                                          {(exp.summary || exp.description) && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                              {exp.summary || exp.description}
                                            </p>
                                          )}
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
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

      <Footer />
    </div>
  );
}

