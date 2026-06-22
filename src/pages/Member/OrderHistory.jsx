import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const statusColor = {
  completed:  "bg-green-100 text-hijau",
  processing: "bg-yellow-100 text-kuning",
  pending:    "bg-blue-100 text-biru",
  cancelled:  "bg-red-100 text-merah",
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => { loadOrders(); }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, status, subtotal, discount_percent, discount_amount, total_amount, created_at")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    setItemsLoading(true);

    const { data } = await supabase
      .from("order_items")
      .select("id, quantity, unit_price, total_price, products(name)")
      .eq("order_id", order.id);

    setOrderItems(data || []);
    setItemsLoading(false);
  };

  return (
    <div>
      <PageHeader title="My Orders" breadcrumb="Order History" />

      <div className="mx-4 bg-white rounded-xl shadow-md p-5">
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState text="You haven't placed any orders yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-garis text-teks-samping">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Subtotal</th>
                  <th className="pb-3 font-semibold">Discount</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-teks text-xs">{order.id.slice(0, 8)}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-teks-samping">Rp {Number(order.subtotal).toLocaleString("id-ID")}</td>
                    <td className="py-3 text-teks-sampang">{order.discount_percent}%</td>
                    <td className="py-3 font-semibold text-teks">Rp {Number(order.total_amount).toLocaleString("id-ID")}</td>
                    <td className="py-3 text-teks-samping text-xs">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="text-emerald-600 hover:underline text-xs font-medium"
                      >
                        View Items
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-teks">
                Order #{selectedOrder.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => { setSelectedOrder(null); setOrderItems([]); }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mb-4 text-sm space-y-1">
              <p className="text-teks-samping">
                Status: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[selectedOrder.status]}`}>{selectedOrder.status}</span>
              </p>
              <p className="text-teks-samping">Date: {new Date(selectedOrder.created_at).toLocaleString("id-ID")}</p>
            </div>

            {itemsLoading ? (
              <LoadingSpinner text="Loading items..." />
            ) : orderItems.length === 0 ? (
              <p className="text-gray-400 text-sm">No items found.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-garis last:border-0">
                    <div>
                      <p className="font-medium text-teks">{item.products?.name || "Product"}</p>
                      <p className="text-xs text-teks-samping">
                        {item.quantity} x Rp {Number(item.unit_price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="font-semibold text-teks">
                      Rp {Number(item.total_price).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-garis pt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-teks-samping">Subtotal</span>
                <span>Rp {Number(selectedOrder.subtotal).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teks-samping">Discount ({selectedOrder.discount_percent}%)</span>
                <span className="text-merah">- Rp {Number(selectedOrder.discount_amount).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-garis pt-2">
                <span>Total</span>
                <span className="text-hijau">Rp {Number(selectedOrder.total_amount).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              onClick={() => { setSelectedOrder(null); setOrderItems([]); }}
              className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
