import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { supabase } from "../../lib/supabase";

const statusOptions = ["pending", "processing", "completed", "cancelled"];

const statusColor = {
  completed:  "bg-green-100 text-hijau",
  processing: "bg-yellow-100 text-kuning",
  pending:    "bg-blue-100 text-biru",
  cancelled:  "bg-red-100 text-merah",
};

export default function AdminOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, subtotal, discount_percent, discount_amount, total_amount, created_at, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(`Order status updated to "${newStatus}"`);
    setTimeout(() => setSuccess(""), 3000);
    loadOrders();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess("Order deleted successfully!");
    setTimeout(() => setSuccess(""), 3000);
    loadOrders();
  };

  return (
    <div>
      <PageHeader title="Orders" breadcrumb="Order List" />

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="mx-4 mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      <div className="mx-4 bg-white rounded-xl shadow-md p-5">
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState text="No orders yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-garis text-teks-samping">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Subtotal</th>
                  <th className="pb-3 font-semibold">Discount</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-teks text-xs">{order.id.slice(0, 8)}</td>
                    <td className="py-3 text-teks-samping">{order.profiles?.full_name || "Unknown"}</td>
                    <td className="py-3 text-teks-samping">Rp {Number(order.subtotal).toLocaleString("id-ID")}</td>
                    <td className="py-3 text-teks-samping">{order.discount_percent}% (Rp {Number(order.discount_amount).toLocaleString("id-ID")})</td>
                    <td className="py-3 font-semibold text-teks">Rp {Number(order.total_amount).toLocaleString("id-ID")}</td>
                    <td className="py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer ${statusColor[order.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-teks-samping text-xs">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
