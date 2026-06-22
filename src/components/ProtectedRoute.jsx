import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { session, profile, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Jika profile tidak muncul dalam 5 detik setelah session ada,
  // anggap gagal dan redirect ke login
  useEffect(() => {
    if (!loading && session && !profile) {
      const t = setTimeout(() => setTimedOut(true), 5000);
      return () => clearTimeout(t);
    }
  }, [loading, session, profile]);

  if (loading) return <Loading />;

  // Not logged in -> redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but no profile yet -> tunggu sebentar
  if (!profile) {
    if (timedOut) {
      // Profile tidak bisa diambil, paksa logout balik ke login
      return <Navigate to="/login" replace />;
    }
    return <Loading />;
  }

  // Logged in but role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    if (profile.role === "admin") {
      return <Navigate to="/administrator/dashboard" replace />;
    }
    if (profile.role === "member") {
      return <Navigate to="/member/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
