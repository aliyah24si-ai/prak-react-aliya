import { useState, useEffect } from "react";
import { FaShoppingCart, FaTruck, FaBan, FaDollarSign, FaStar, FaUsers } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalDelivered: 0,
    totalCancelled: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const [
      { count: orderCount },
      { count: deliveredCount },
      { count: cancelledCount },
      { data: revenueData },
      { count: customerCount },
      { count: productCount },
      { data: recentData },
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("orders").select("total_amount").eq("status", "completed"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase
        .from("orders")
        .select("id, status, total_amount, created_at, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const totalRevenue = (revenueData || []).reduce(
      (sum, r) => sum + Number(r.total_amount || 0), 0
    );

    setStats({
      totalOrders: orderCount || 0,
      totalDelivered: deliveredCount || 0,
      totalCancelled: cancelledCount || 0,
      totalRevenue,
      totalCustomers: customerCount || 0,
      totalProducts: productCount || 0,
    });

    setRecentOrders(
      (recentData || []).map((o) => ({
        id: o.id.slice(0, 8),
        customer: o.profiles?.full_name || "Unknown",
        status: o.status,
        total: `Rp ${Number(o.total_amount).toLocaleString("id-ID")}`,
        date: new Date(o.created_at).toLocaleDateString("id-ID"),
      }))
    );

    setLoading(false);
  };

  const statusColor = {
    completed: "bg-green-100 text-hijau",
    processing: "bg-yellow-100 text-kuning",
    pending:    "bg-blue-100 text-biru",
    cancelled:  "bg-red-100 text-merah",
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div id="dashboard-container">
      <PageHeader title="Dashboard" breadcrumb="Overview" />

      <div id="dashboard-grid" className="p-5 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FaShoppingCart />} count={stats.totalOrders}     label="Total Orders"     iconBg="bg-hijau" />
        <StatCard icon={<FaTruck />}         count={stats.totalDelivered} label="Total Delivered"  iconBg="bg-biru" />
        <StatCard icon={<FaBan />}           count={stats.totalCancelled} label="Total Canceled"   iconBg="bg-merah" />
        <StatCard icon={<FaDollarSign />}    count={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`} label="Total Revenue" iconBg="bg-kuning" />
      </div>

      <div className="px-5 grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={<FaUsers />} count={stats.totalCustomers} label="Total Customers" iconBg="bg-biru" />
        <StatCard icon={<FaStar />}  count={stats.totalProducts}  label="Active Products" iconBg="bg-kuning" />
      </div>

      <div className="px-5">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-teks mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-garis text-teks-samping">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-teks">{order.id}</td>
                      <td className="py-3 text-teks-samping">{order.customer}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-500"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-teks">{order.total}</td>
                      <td className="py-3 text-teks-samping">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
