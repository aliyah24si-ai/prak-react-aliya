import { FaShoppingCart, FaTruck, FaBan, FaDollarSign, FaStar, FaUsers } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

const recentOrders = [
  { id: "#001", customer: "Budi Santoso", menu: "Nasi Goreng", status: "Delivered", total: "Rp 45.000" },
  { id: "#002", customer: "Siti Rahayu", menu: "Mie Ayam", status: "On Process", total: "Rp 32.000" },
  { id: "#003", customer: "Ahmad Fauzi", menu: "Soto Ayam", status: "Canceled", total: "Rp 28.000" },
  { id: "#004", customer: "Dewi Lestari", menu: "Gado-gado", status: "Delivered", total: "Rp 25.000" },
  { id: "#005", customer: "Rudi Hartono", menu: "Rendang", status: "On Process", total: "Rp 55.000" },
];

const statusColor = {
  "Delivered": "bg-green-100 text-hijau",
  "On Process": "bg-yellow-100 text-kuning",
  "Canceled": "bg-red-100 text-merah",
};

export default function Dashboard() {
  return (
    <div id="dashboard-container">
      <PageHeader title="Dashboard" breadcrumb="Overview" />

      <div id="dashboard-grid" className="p-5 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FaShoppingCart />} count="75" label="Total Orders" iconBg="bg-hijau" />
        <StatCard icon={<FaTruck />} count="175" label="Total Delivered" iconBg="bg-biru" />
        <StatCard icon={<FaBan />} count="40" label="Total Canceled" iconBg="bg-merah" />
        <StatCard icon={<FaDollarSign />} count="Rp 128jt" label="Total Revenue" iconBg="bg-kuning" />
      </div>

      <div className="px-5 grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={<FaStar />} count="4.8" label="Average Rating" iconBg="bg-kuning" />
        <StatCard icon={<FaUsers />} count="320" label="Total Customers" iconBg="bg-biru" />
      </div>

      <div className="px-5">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-teks mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-garis text-teks-samping">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Menu</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-teks">{order.id}</td>
                    <td className="py-3 text-teks-samping">{order.customer}</td>
                    <td className="py-3 text-teks-samping">{order.menu}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-teks">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
