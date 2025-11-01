import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { hostApplicationAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2, User, Coffee, Upload, CheckCircle, ArrowRight, ArrowLeft, Globe } from "lucide-react";

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Experience Details", icon: Coffee },
  { id: 3, name: "Media Upload", icon: Upload },
  { id: 4, name: "Review & Submit", icon: CheckCircle },
];

const languages = ["Amharic", "English", "Oromiffa", "Tigrinya", "French", "Arabic"];

export default function HostApplication() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: user?.email || "",
    phoneNumber: "",
    cityRegion: "",
    fullAddress: "",
    languagesSpoken: [] as string[],
    aboutYou: "",
  });

  const [experienceDetails, setExperienceDetails] = useState({
    experienceTypes: [] as string[],
    specialties: [] as string[],
    previousExperience: "",
  });

  const [media, setMedia] = useState({
    profilePhoto: "",
    identificationPhoto: "",
    additionalPhotos: [] as string[],
    documents: [] as string[],
  });

  const [faydaAuth, setFaydaAuth] = useState<any>(null);
  const [fcn, setFcn] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInitiated, setOtpInitiated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.hostStatus === "approved") {
      navigate("/profile");
      toast({
        title: "Already a host",
        description: "You are already an approved host.",
      });
      return;
    }

    // Check URL params for Fayda callback
    const step = searchParams.get("step");
    const status = searchParams.get("status");
    if (step === "4" && status === "success") {
      setCurrentStep(4);
      fetchApplication();
    } else {
      fetchApplication();
    }
  }, [isAuthenticated, user, navigate, searchParams, toast]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await hostApplicationAPI.getMyApplication();
      if (response.data?.application) {
        const app = response.data.application;
        if (app.personalInfo) setPersonalInfo({ ...personalInfo, ...app.personalInfo });
        if (app.experienceDetails) setExperienceDetails({ ...experienceDetails, ...app.experienceDetails });
        if (app.media) setMedia({ ...media, ...app.media });
        if (app.faydaAuth) setFaydaAuth(app.faydaAuth);
        if (app.status === "pending" || app.status === "approved") {
          navigate("/profile");
        }
      }
    } catch (error: any) {
      console.error("Error fetching application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate personal info
      if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phoneNumber || 
          !personalInfo.cityRegion || !personalInfo.aboutYou || personalInfo.languagesSpoken.length === 0) {
        toast({
          title: "Missing fields",
          description: "Please fill out all required fields.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        await hostApplicationAPI.createOrUpdate(personalInfo);
        setCurrentStep(2);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save personal information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 2) {
      try {
        setIsLoading(true);
        await hostApplicationAPI.updateExperienceDetails(experienceDetails);
        setCurrentStep(3);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save experience details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 3) {
      try {
        setIsLoading(true);
        await hostApplicationAPI.updateMedia(media);
        setCurrentStep(4);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save media.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await hostApplicationAPI.submitApplication();
      toast({
        title: "Application submitted!",
        description: "Your host application has been submitted for review.",
      });
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = (language: string) => {
    setPersonalInfo({
      ...personalInfo,
      languagesSpoken: personalInfo.languagesSpoken.includes(language)
        ? personalInfo.languagesSpoken.filter((l) => l !== language)
        : [...personalInfo.languagesSpoken, language],
    });
  };

  if (isLoading && !personalInfo.fullName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary-light to-earth">
      <Navigation />
      <main className="flex-1 pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-muted"
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <p className={`mt-2 text-sm ${currentStep >= step.id ? "font-semibold" : "text-muted-foreground"}`}>
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentStep === 1 && <><User className="w-5 h-5" /> Personal Information</>}
                    {currentStep === 2 && <><Coffee className="w-5 h-5" /> Experience Details</>}
                    {currentStep === 3 && <><Upload className="w-5 h-5" /> Media Upload</>}
                    {currentStep === 4 && <><CheckCircle className="w-5 h-5" /> Review & Submit</>}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Please provide your personal information"}
                    {currentStep === 2 && "Tell us about your experience"}
                    {currentStep === 3 && "Upload photos and documents"}
                    {currentStep === 4 && "Review your application before submitting"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          value={personalInfo.phoneNumber}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                          placeholder="+251 xxx xxx xxx"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cityRegion">City/Region *</Label>
                        <Input
                          id="cityRegion"
                          value={personalInfo.cityRegion}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, cityRegion: e.target.value })}
                          placeholder="Addis Ababa, Ethiopia"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullAddress">Full Address</Label>
                        <Textarea
                          id="fullAddress"
                          value={personalInfo.fullAddress}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullAddress: e.target.value })}
                          placeholder="Your full address where the experience will take place"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Languages Spoken *</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {languages.map((lang) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={lang}
                                checked={personalInfo.languagesSpoken.includes(lang)}
                                onChange={() => toggleLanguage(lang)}
                                className="w-4 h-4"
                              />
                              <Label htmlFor={lang} className="cursor-pointer">{lang}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="aboutYou">About You *</Label>
                        <Textarea
                          id="aboutYou"
                          value={personalInfo.aboutYou}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, aboutYou: e.target.value })}
                          placeholder="Tell us about yourself, your background, and why you want to become a host..."
                          rows={5}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Experience Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="previousExperience">Previous Experience</Label>
                        <Textarea
                          id="previousExperience"
                          value={experienceDetails.previousExperience}
                          onChange={(e) => setExperienceDetails({ ...experienceDetails, previousExperience: e.target.value })}
                          placeholder="Tell us about your previous experience as a host or in the tourism industry..."
                          rows={5}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Media Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Media upload functionality will be implemented with file storage.
                        For now, you can proceed to Fayda authentication.
                      </p>
                    </div>
                  )}

                  {/* Step 4: Review & Submit */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Personal Information</h3>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p><strong>Name:</strong> {personalInfo.fullName}</p>
                          <p><strong>Email:</strong> {personalInfo.email}</p>
                          <p><strong>Phone:</strong> {personalInfo.phoneNumber}</p>
                          <p><strong>City/Region:</strong> {personalInfo.cityRegion}</p>
                          <p><strong>Languages:</strong> {personalInfo.languagesSpoken.join(", ")}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Fayda Verification</h3>
                        {faydaAuth?.verified ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Globe className="w-5 h-5" />
                            <span>Pending verification</span>
                          </div>
                        )}
                      </div>
                      {!faydaAuth?.verified && (
                        <Button
                          onClick={() => {
                            hostApplicationAPI.initiateFaydaAuth().then((response) => {
                              if (response.data?.authUrl) {
                                window.location.href = response.data.authUrl;
                              }
                            });
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Verify with Fayda
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    {currentStep < 4 ? (
                      <Button
                        onClick={handleNext}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !faydaAuth?.verified}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Submit Application
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

