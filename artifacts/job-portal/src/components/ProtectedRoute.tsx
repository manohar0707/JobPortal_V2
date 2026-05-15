import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, token } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        setLocation("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "seeker") setLocation("/seeker/dashboard");
        else if (user.role === "recruiter") setLocation("/recruiter/dashboard");
        else if (user.role === "admin") setLocation("/admin/dashboard");
        else setLocation("/");
      }
    }
  }, [user, isLoading, token, setLocation, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
