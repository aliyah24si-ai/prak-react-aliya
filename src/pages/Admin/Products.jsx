import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { supabase } from "../../lib/supabase";

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", stock: "", is_active: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", stock: "", is_active: true });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      is_active: product.is_active,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId);

      if (error) { setError(error.message); return; }
      setSuccess("Product updated successfully!");
    } else {
      const { error } = await supabase
        .from("products")
        .insert({ ...payload, is_active: true });

      if (error) { setError(error.message); return; }
      setSuccess("Product added successfully!");
    }

    setTimeout(() => setSuccess(""), 3000);
    setShowForm(false);
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to deactivate this product?")) return;

    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) { setError(error.message); return; }
    setSuccess("Product deactivated successfully!");
    setTimeout(() => setSuccess(""), 3000);
    loadProducts();
  };

  return (
    <div>
      <PageHeader title="Products" breadcrumb={["Dashboard", "Product List"]}>
        <button
          onClick={handleAdd}
          className="bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Product
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
            {editingId ? "Edit Product" : "Form Add Product"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Product Name</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Description</label>
                <input name="description" value={form.description} onChange={handleChange}
                  className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Price (Rp)</label>
                <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required
                  className="w-full border border-garis rounded-lg p-2 text-sm outline-none focus:border-hijau" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teks-samping mb-1">Stock</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required
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

      <div className="mx-4 bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : products.length === 0 ? (
          <EmptyState text="No products found." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Name", "Description", "Price", "Stock", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    <Link
                      to={`/administrator/products/${p.id}`}
                      className="text-emerald-500 hover:text-emerald-600"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.description}</td>
                  <td className="px-4 py-3 text-gray-700">
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs font-medium">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
