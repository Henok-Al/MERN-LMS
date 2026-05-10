import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { GraduationCap, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const courseId = searchParams.get("courseId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId && !courseId) {
      setLoading(false);
      return;
    }
    // If redirected from Stripe, verify enrollment
    const verifyPayment = async () => {
      try {
        if (sessionId) {
          await api.post("/payments/verify", { sessionId });
        }
      } catch {
        // silently fail - enrollment may have been created via webhook
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [sessionId, courseId]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-3 text-primary" />
          <span className="font-extrabold text-xl tracking-tight">Skillio</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {loading ? (
            <div className="py-12">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold">Verifying your payment...</h2>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Thank you for your purchase! You now have access to your course.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => courseId ? navigate(`/dashboard/course/${courseId}`) : navigate("/dashboard")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Course
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
                  My Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}