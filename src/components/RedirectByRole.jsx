import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";

export default function RedirectByRole() {
  const { session, profile, loading } = useAuth();

  if (loading) return <Loading />;

  // Not logged in -> redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Redirect by role
  if (profile?.role === "admin") {
    return <Navigate to="/administrator/dashboard" replace />;
  }

  if (profile?.role === "member") {
    return <Navigate to="/member/dashboard" replace />;
  }

  // Fallback: guest or unknown role
  return <Navigate to="/login" replace />;
}
