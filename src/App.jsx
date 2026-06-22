import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectByRole from "./components/RedirectByRole";
import Loading from "./components/Loading";

// Layouts
const MainLayout    = React.lazy(() => import("./layouts/MainLayout"));
const AuthLayout    = React.lazy(() => import("./layouts/AuthLayout"));
const AdminLayout   = React.lazy(() => import("./layouts/AdminLayout"));
const MemberLayout  = React.lazy(() => import("./layouts/MemberLayout"));

// Auth pages
const Login    = React.lazy(() => import("./pages/Auth/Login"));
const Register = React.lazy(() => import("./pages/Auth/Register"));
const Forgot   = React.lazy(() => import("./pages/Auth/Forgot"));

// Admin pages
const AdminDashboard  = React.lazy(() => import("./pages/Admin/Dashboard"));
const AdminCustomers  = React.lazy(() => import("./pages/Admin/Customers"));
const AdminProducts   = React.lazy(() => import("./pages/Admin/Products"));
const AdminProductDetail = React.lazy(() => import("./pages/Admin/ProductDetail"));
const AdminOrders     = React.lazy(() => import("./pages/Admin/Orders"));

// Member pages
const MemberDashboard   = React.lazy(() => import("./pages/Member/Dashboard"));
const MemberCreateOrder = React.lazy(() => import("./pages/Member/CreateOrder"));
const MemberOrderHistory = React.lazy(() => import("./pages/Member/OrderHistory"));
const MemberPoints      = React.lazy(() => import("./pages/Member/Points"));

// Legacy pages (kept for backward compat)
const NotFound    = React.lazy(() => import("./pages/Main/NotFound"));
const Components  = React.lazy(() => import("./pages/Main/Components"));
const FiturXyz    = React.lazy(() => import("./pages/Main/FiturXyz"));
const Notes       = React.lazy(() => import("./pages/Main/Notes"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot"   element={<Forgot />} />
        </Route>

        {/* Root redirect by role */}
        <Route path="/" element={<RedirectByRole />} />

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/administrator/dashboard"       element={<AdminDashboard />} />
            <Route path="/administrator/customers"       element={<AdminCustomers />} />
            <Route path="/administrator/products"        element={<AdminProducts />} />
            <Route path="/administrator/products/:id"    element={<AdminProductDetail />} />
            <Route path="/administrator/orders"          element={<AdminOrders />} />
          </Route>
        </Route>

        {/* Member routes */}
        <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
          <Route element={<MemberLayout />}>
            <Route path="/member/dashboard"     element={<MemberDashboard />} />
            <Route path="/member/create-order"  element={<MemberCreateOrder />} />
            <Route path="/member/orders"        element={<MemberOrderHistory />} />
            <Route path="/member/points"        element={<MemberPoints />} />
          </Route>
        </Route>

        {/* Legacy routes (optional, inside main layout - no auth required) */}
        <Route element={<MainLayout />}>
          <Route path="/components" element={<Components />} />
          <Route path="/fitur-xyz"  element={<FiturXyz />} />
          <Route path="/notes"      element={<Notes />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}
