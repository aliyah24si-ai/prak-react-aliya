import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { supabase } from "../../lib/supabase";

const tierColor = {
  Gold:     "bg-yellow-100 text-kuning",
  Silver:   "bg-gray-100 text-gray-500",
  Bronze:   "bg-orange-100 text-orange-500",
  Platinum: "bg-purple-100 text-purple-600",
};

export default function AdminCustomers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, tier, role, created_at")
      .eq("role", "member")
      .order("created_at", { ascending: false });

    if (!error) setCustomers(data || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ full_name: "", email: "", phone: "" });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      full_name: customer.full_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (editingId) {
      // Update existing customer profile
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: form.full_name, email: form.email, phone: form.phone })
        .eq("id", editingId);

      if (error) {
        setError(error.message);
        return;
      }
      setSuccess("Customer updated successfully!");
    } else {
      // Create new customer via Supabase Auth (invite / signup)
      // Generate random password karena admin yang buat
      const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
      const { data: authData, error: authError } = await supabase.auth.admin
        ? // Jika menggunakan service role key (tidak tersedia di client)
          { data: null, error: { message: "Admin user creation requires server-side call" } }
        : await supabase.auth.signUp({
            email: form.email,
            password: tempPassword,
            options: { data: { full_name: form.full_name, role: "member" } },
          });

      if (authError) {
        // Fallback: insert langsung ke profiles dengan UUID baru
        // Ini hanya berfungsi jika tabel profiles tidak enforce FK ke auth.users
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            role: "member",
            points: 0,
            tier: "Bronze",
          });

        if (insertError) {
          setError("Gagal membuat customer. Minta customer untuk register sendiri, atau gunakan Supabase Dashboard untuk invite user.");
          return;
        }
      } else if (authData?.user) {
        // Update profile dengan phone number
        await supabase
          .from("profiles")
          .update({ phone: form.phone })
          .eq("id", authData.user.id);
      }

      setSuccess("Customer added! Password sementara telah dikirim ke email mereka.");
    }

    setTimeout(() => setSuccess(""), 5000);
    setShowForm(false);
    loadCustomers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess("Customer deleted successfully!");
    setTimeout(() => setSuccess(""), 3000);
    loadCustomers();
  };

  return (
    <div>
      <PageHeader title="Customers" breadcrumb="Customer List">
        <button
          onClick={handleAdd}
          className="bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Customer
        </button>
      </PageHeader>

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="mx-4 mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      {showForm && (
        <div className="mx-4 mb-4 bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-teks mb-4">
            {editingId ? "Edit Customer" : "Form Add Customer"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Customer Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} required
                  className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                {editingId ? "Update" : "Simpan"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mx-4 bg-white rounded-xl shadow-md p-5">
        {loading ? (
          <LoadingSpinner text="Loading customers..." />
        ) : customers.length === 0 ? (
          <EmptyState text="No customers found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-garis text-teks-samping">
                  <th className="pb-3 font-semibold">Customer Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-teks">{customer.full_name}</td>
                    <td className="py-3 text-teks-samping">{customer.email}</td>
                    <td className="py-3 text-teks-samping">{customer.phone || "-"}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierColor[customer.tier] || "bg-gray-100 text-gray-500"}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="py-3 space-x-2">
                      <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:underline text-xs font-medium">Delete</button>
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
