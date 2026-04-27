import { useState } from "react";
import ordersData from "../../data/orders.json";
import PageHeader from "../../components/PageHeader";

const statusColor = {
  "Completed": "bg-green-100 text-hijau",
  "Pending": "bg-yellow-100 text-kuning",
  "Cancelled": "bg-red-100 text-merah",
};

export default function Orders() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "", status: "Pending", totalPrice: "", orderDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div>
      <PageHeader title="Orders" breadcrumb="Order List">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Orders
        </button>
      </PageHeader>

      {showForm && (
        <div className="mx-4 mb-4 bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-teks mb-4">Form Add Order</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Customer Name</label>
              <input name="customerName" value={form.customerName} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
            </div>
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau bg-white">
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Total Price</label>
              <input name="totalPrice" type="number" value={form.totalPrice} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
            </div>
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Order Date</label>
              <input name="orderDate" type="date" value={form.orderDate} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
            </div>
          </div>
          <button className="mt-4 bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90">
            Simpan
          </button>
        </div>
      )}

      <div className="mx-4 bg-white rounded-xl shadow-md p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-garis text-teks-samping">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Customer Name</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Total Price</th>
                <th className="pb-3 font-semibold">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {ordersData.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-teks">{order.id}</td>
                  <td className="py-3 text-teks-samping">{order.customerName}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-teks-samping">Rp {order.totalPrice.toLocaleString("id-ID")}</td>
                  <td className="py-3 text-teks-samping">{order.orderDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
