import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast({
        title: "OAuth Error",
        description: error || "Failed to authenticate with OAuth provider",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (token) {
      loginWithOAuth(token)
        .then(() => {
          toast({
            title: "Welcome!",
            description: "You have successfully logged in",
          });
          // Get redirect URL from query params or default to home
          const redirect = searchParams.get("redirect") || "/";
          navigate(redirect);
        })
        .catch((err: any) => {
          toast({
            title: "Authentication Failed",
            description: err.message || "Failed to complete authentication",
            variant: "destructive",
          });
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, loginWithOAuth, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-earth">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

