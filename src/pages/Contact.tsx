import { useState } from "react";
import emailjs from "@emailjs/browser";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      toast({
        title: "Email not configured",
        description:
          "EmailJS keys are missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY in your environment.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const templateParams = {
      from_name: name,
      from_email: email,
      subject,
      message,
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setIsSuccess(true);
      toast({
        title: "Message sent!",
        description: "We will get back to you as soon as possible",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      console.error("EmailJS error", err);
      toast({
        title: "Send failed",
        description: err?.text || "Failed to send message. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <PageHeader
          title="Get in Touch"
          description="Have questions about our home experiences? We're here to help you plan your perfect cultural connection."
          className="text-center"
        />

        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-base">Email</h3>
                          <a 
                            href="mailto:info@etxplore.com"
                            className="text-primary hover:underline text-sm"
                          >
                            info@etxplore.com
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-base">Phone</h3>
                          <a 
                            href="tel:+251111234567"
                            className="text-primary hover:underline text-sm"
                          >
                            +251 11 123 4567
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-base">Address</h3>
                          <p className="text-muted-foreground text-sm">
                            Bole, Addis Ababa
                            <br />
                            Ethiopia
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Response Time Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1 text-sm">Response Time</h3>
                          <p className="text-xs text-muted-foreground">
                            We typically respond within 24 hours during business days.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20">
                        <CardContent className="p-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                              <p className="text-muted-foreground mb-4">
                                We've received your message and will get back to you as soon as possible.
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => setIsSuccess(false)}
                              >
                                Send Another Message
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="border-2 shadow-xl">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-primary" />
                            Send us a Message
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">
                            Fill out the form below and we'll get back to you soon.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                  Your Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="name"
                                  placeholder="John Doe"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  disabled={isSubmitting}
                                  required
                                  className="h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                  Email Address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="john@example.com"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  disabled={isSubmitting}
                                  required
                                  className="h-11"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subject" className="text-sm font-medium">
                                Subject <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="subject"
                                placeholder="What is this about?"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="message" className="text-sm font-medium">
                                Message <span className="text-destructive">*</span>
                              </Label>
                              <Textarea
                                id="message"
                                placeholder="Tell us more about your inquiry..."
                                rows={8}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="resize-none"
                              />
                              <p className="text-xs text-muted-foreground">
                                {message.length} characters
                              </p>
                            </div>
                            <Button
                              type="submit"
                              variant="hero"
                              size="lg"
                              className="w-full"
                              disabled={isSubmitting || !name || !email || !subject || !message}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Message
                                </>
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
