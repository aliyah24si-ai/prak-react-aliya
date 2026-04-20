import { useState } from "react";
import customersData from "../data/customers.json";
import PageHeader from "../components/PageHeader";

const loyaltyColor = {
  "Gold": "bg-yellow-100 text-kuning",
  "Silver": "bg-gray-100 text-gray-500",
  "Bronze": "bg-orange-100 text-orange-500",
};

export default function Customers() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "", email: "", phone: "", loyalty: "Bronze",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div>
      <PageHeader title="Customers" breadcrumb="Customer List">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Customer
        </button>
      </PageHeader>

      {showForm && (
        <div className="mx-4 mb-4 bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-teks mb-4">Form Add Customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Customer Name</label>
              <input name="customerName" value={form.customerName} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
            </div>
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
            </div>
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
            </div>
            <div>
              <label className="block text-sm font-medium text-teks-samping mb-1">Loyalty</label>
              <select name="loyalty" value={form.loyalty} onChange={handleChange}
                className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau bg-white">
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
              </select>
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
                <th className="pb-3 font-semibold">Customer ID</th>
                <th className="pb-3 font-semibold">Customer Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Loyalty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {customersData.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-teks">{customer.id}</td>
                  <td className="py-3 text-teks-samping">{customer.customerName}</td>
                  <td className="py-3 text-teks-samping">{customer.email}</td>
                  <td className="py-3 text-teks-samping">{customer.phone}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${loyaltyColor[customer.loyalty]}`}>
                      {customer.loyalty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
