import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { User, Mail, LogOut, Edit, Save, X, MapPin, Wallet as WalletIcon, Banknote, CreditCard, Calendar, Shield, CheckCircle, Clock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usersAPI } from "@/lib/api";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  // Bank info local state
  const [bankEditing, setBankEditing] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    // Prefill from user if available
    if ((user as any)?.cbeAccountName) setAccountName((user as any).cbeAccountName);
    if ((user as any)?.cbeAccountNumber) setAccountNumber((user as any).cbeAccountNumber);
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const handleSave = async () => {
    if (!name || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await usersAPI.updateMe({ name, email });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
      const updatedUser = { ...(user as any), name, email };
      updateUser(updatedUser as any);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  const saveBankInfo = async () => {
    try {
      await usersAPI.updateMe({ cbeAccountName: accountName || undefined, cbeAccountNumber: accountNumber || undefined });
      // Update auth context so other pages (Wallet) see fresh values immediately
      const updatedUser = { ...(user as any), cbeAccountName: accountName || undefined, cbeAccountNumber: accountNumber || undefined };
      (updateUser as any)(updatedUser);
      toast({ title: "CBE account saved", description: "Used for withdrawals." });
      setBankEditing(false);
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const mask = (val: string) => (val ? `****${String(val).slice(-4)}` : "—");

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <PageHeader
          title="My Profile"
          className="text-center"
        />

        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card className="border-2 shadow-lg sticky top-24">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="w-24 h-24 border-4 border-primary/20">
                        <AvatarImage src={(user as any)?.photo} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center w-full">
                        {user?.role === 'admin' && (
                          <Badge variant="default" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </Badge>
                        )}
                        {user?.hostStatus === 'approved' && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Host
                          </Badge>
                        )}
                        {user?.hostStatus === 'pending' && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Host Pending
                          </Badge>
                        )}
                        {user?.guideStatus === 'approved' && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Guide
                          </Badge>
                        )}
                        {user?.guideStatus === 'pending' && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Guide Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Settings className="w-6 h-6" />
                          Account Information
                        </CardTitle>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Full Name
                          </Label>
                          {isEditing ? (
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              disabled={isLoading}
                              className="h-11"
                            />
                          ) : (
                            <div className="h-11 flex items-center px-3 bg-muted/50 rounded-md border">
                              <p className="font-medium">{user?.name || '—'}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            Email Address
                          </Label>
                          {isEditing ? (
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              className="h-11"
                            />
                          ) : (
                            <div className="h-11 flex items-center px-3 bg-muted/50 rounded-md border">
                              <p className="font-medium">{user?.email || '—'}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="hero"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {/* Bank Info - CBE only, visible to approved hosts (not admin) */}
                      {user?.hostStatus === "approved" && user?.role !== "admin" && (
                        <div className="pt-6 border-t space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Bank Account Information</h3>
                          </div>
                          {!bankEditing ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Bank</p>
                                  <p className="font-medium">CBE</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Account Name</p>
                                  <p className="font-medium">{accountName || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                                  <p className="font-medium">{mask(accountNumber)}</p>
                                </div>
                              </div>
                              <Button variant="outline" onClick={() => setBankEditing(true)} className="w-full">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Bank Info
                              </Button>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Account Name</Label>
                                  <Input 
                                    value={accountName} 
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="Enter account holder name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Account Number</Label>
                                  <Input 
                                    value={accountNumber} 
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="Enter account number"
                                    maxLength={20}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="hero" onClick={saveBankInfo} className="flex-1">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button variant="outline" onClick={() => setBankEditing(false)} className="flex-1">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/my-bookings")}
                          className="w-full justify-start"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          My Bookings
                        </Button>
                        {user?.role !== "admin" && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/my-reviews")}
                            className="w-full justify-start"
                          >
                            <User className="w-4 h-4 mr-2" />
                            My Reviews
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/update-password")}
                          className="w-full justify-start"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>
                      </div>

                      {user?.role === "admin" && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Button
                                variant="hero"
                                size="lg"
                                onClick={() => navigate("/admin/dashboard")}
                                className="w-full"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Dashboard
                              </Button>
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate("/admin/payouts")}
                                className="w-full"
                              >
                                <Banknote className="w-4 h-4 mr-2" />
                                Payouts
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {user?.hostStatus !== "approved" && user?.role !== "admin" && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Become a Host
                            </p>
                            <Button
                              variant="hero"
                              size="lg"
                              onClick={() => navigate("/host-application")}
                              className="w-full"
                              disabled={user?.hostStatus === "pending"}
                            >
                              {user?.hostStatus === "pending" ? (
                                <>
                                  <Clock className="w-4 h-4 mr-2" />
                                  Application Pending Review
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4 mr-2" />
                                  Apply to Become a Host
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      )}

                      {user?.guideStatus !== "approved" && user?.role !== "admin" && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Become a Guide
                            </p>
                            <Button
                              variant="hero"
                              size="lg"
                              onClick={() => navigate("/guide-application")}
                              className="w-full"
                              disabled={user?.guideStatus === "pending"}
                            >
                              {user?.guideStatus === "pending" ? (
                                <>
                                  <Clock className="w-4 h-4 mr-2" />
                                  Application Pending Review
                                </>
                              ) : (
                                <>
                                  <User className="w-4 h-4 mr-2" />
                                  Apply to Become a Guide
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      )}

                      {user?.guideStatus === "approved" && user?.role !== "admin" && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Guide Panel
                            </p>
                            <Button
                              variant="hero"
                              size="lg"
                              onClick={() => navigate("/guide/dashboard")}
                              className="w-full"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Guide Dashboard
                            </Button>
                          </div>
                        </>
                      )}

                      {user?.hostStatus === "approved" && user?.role !== "admin" && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Host Panel
                            </p>
                            <div className="space-y-3">
                              <Button
                                variant="hero"
                                size="lg"
                                onClick={() => navigate("/admin/experiences")}
                                className="w-full"
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                Manage My Experiences
                              </Button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => navigate("/host/wallet")}
                                  className="w-full"
                                >
                                  <WalletIcon className="w-4 h-4 mr-2" />
                                  Wallet
                                </Button>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => navigate("/host/withdrawals")}
                                  className="w-full"
                                >
                                  <Banknote className="w-4 h-4 mr-2" />
                                  Withdrawals
                                </Button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <Separator className="my-4" />
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleLogout}
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
