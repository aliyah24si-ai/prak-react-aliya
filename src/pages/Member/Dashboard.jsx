import { useState, useEffect } from "react";
import { FaShoppingCart, FaDollarSign, FaStar } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const tierDiscount = {
  Bronze: 5,
  Silver: 10,
  Gold: 15,
  Platinum: 20,
};

const tierColors = {
  Bronze:   "from-orange-400 to-orange-600",
  Silver:   "from-gray-400 to-gray-600",
  Gold:     "from-yellow-400 to-yellow-600",
  Platinum: "from-purple-400 to-purple-600",
};

export default function MemberDashboard() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ orderCount: 0, totalSpent: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);

    const [
      { count: orderCount },
      { data: spentData },
      { data: recentData },
      { data: pointData },
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("member_id", user.id),
      supabase.from("orders").select("total_amount").eq("member_id", user.id).eq("status", "completed"),
      supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("point_transactions")
        .select("*")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const totalSpent = (spentData || []).reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    setStats({
      orderCount: orderCount || 0,
      totalSpent,
    });

    setRecentOrders(
      (recentData || []).map((o) => ({
        id: o.id.slice(0, 8),
        status: o.status,
        total: `Rp ${Number(o.total_amount).toLocaleString("id-ID")}`,
        date: new Date(o.created_at).toLocaleDateString("id-ID"),
      }))
    );

    setPointHistory(pointData || []);
    setLoading(false);
  };

  const statusColor = {
    completed:  "bg-green-100 text-hijau",
    processing: "bg-yellow-100 text-kuning",
    pending:    "bg-blue-100 text-biru",
    cancelled:  "bg-red-100 text-merah",
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title="My Dashboard" breadcrumb="Overview" />

      {/* Membership Card */}
      <div className="px-5 mb-6">
        <div className={`bg-gradient-to-r ${tierColors[profile?.tier] || tierColors.Bronze} rounded-2xl shadow-lg p-6 text-white max-w-md`}>
          <p className="text-xs uppercase tracking-widest opacity-80">Membership Card</p>
          <h2 className="text-2xl font-bold mt-2">{profile?.full_name || "Member"}</h2>
          <p className="text-sm opacity-80 mt-1">{profile?.email || user?.email}</p>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-xs opacity-70">Tier</p>
              <p className="text-xl font-bold">{profile?.tier || "Bronze"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70">Points</p>
              <p className="text-xl font-bold">{profile?.points?.toLocaleString("id-ID") || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70">Discount</p>
              <p className="text-xl font-bold">{tierDiscount[profile?.tier] || 5}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={<FaShoppingCart />} count={stats.orderCount} label="My Orders" iconBg="bg-hijau" />
        <StatCard icon={<FaDollarSign />}  count={`Rp ${stats.totalSpent.toLocaleString("id-ID")}`} label="Total Spent" iconBg="bg-biru" />
      </div>

      {/* Recent Orders */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-teks mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet. Start shopping!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-garis text-teks-samping">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-teks">{order.id}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100"}`}>
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

      {/* Point History */}
      <div className="px-5">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-teks mb-4 flex items-center gap-2">
            <FaStar className="text-kuning" /> Point History
          </h3>
          {pointHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No point transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {pointHistory.map((pt) => (
                <div key={pt.id} className="flex justify-between items-center py-2 border-b border-garis last:border-0">
                  <div>
                    <p className="text-sm font-medium text-teks">{pt.description}</p>
                    <p className="text-xs text-teks-samping">
                      {new Date(pt.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className="text-hijau font-bold text-sm">+{pt.points_earned} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
