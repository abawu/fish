import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      setStatus("verifying");
      try {
        await authAPI.verifyEmail(token);
        setStatus("success");
        toast({ title: "Email verified", description: "You can now log in." });
        setTimeout(() => navigate("/login"), 1500);
      } catch (err: any) {
        setStatus("error");
        toast({
          title: "Verification failed",
          description:
            err.response?.data?.message || "Invalid or expired token",
          variant: "destructive",
        });
      }
    };
    verify();
  }, [token, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === "verifying" && <p>Verifying your email...</p>}
        {status === "success" && (
          <p>Your email has been verified. Redirecting to login...</p>
        )}
        {status === "error" && (
          <p>Verification failed. Please request a new verification email.</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
