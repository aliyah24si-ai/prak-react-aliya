import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";

const tierDiscount = {
  Bronze: 5,
  Silver: 10,
  Gold: 15,
  Platinum: 20,
};

export default function CreateOrder() {
  const { profile, user, reloadProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("name");

    setProducts(data || []);
    setLoading(false);
  };

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] <= 1) {
        delete newCart[productId];
      } else {
        newCart[productId] -= 1;
      }
      return newCart;
    });
  };

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    return {
      product_id: productId,
      quantity,
      unit_price: Number(product.price),
      total_price: Number(product.price) * quantity,
      product_name: product.name,
    };
  }).filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const discountPercent = tierDiscount[profile?.tier] || 5;
  const discountAmount = Math.floor(subtotal * discountPercent / 100);
  const totalAmount = subtotal - discountAmount;

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      setError("Please add at least one product to your cart.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          member_id: user.id,
          subtotal,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const items = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      // Decrease stock untuk setiap item (hanya sekali, tanpa rpc)
      for (const item of cartItems) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const newStock = product.stock - item.quantity;
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product_id);
        }
      }

      setSuccess(`Order placed successfully! Total: Rp ${totalAmount.toLocaleString("id-ID")}`);
      setCart({});
      await reloadProfile();
      loadProducts();

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to place order");
    }

    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner text="Loading products..." />;

  return (
    <div>
      <PageHeader title="Create Order" breadcrumb="New Order" />

      {error && (
        <div className="mx-5 mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="mx-5 mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      <div className="px-5 grid lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-semibold text-teks mb-4">Select Products</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <div key={p.id} className="border border-garis rounded-lg p-3 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-teks text-sm">{p.name}</p>
                    <p className="text-xs text-teks-samping">Stock: {p.stock}</p>
                    <p className="text-sm font-semibold text-hijau mt-1">
                      Rp {Number(p.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cart[p.id] ? (
                      <>
                        <button
                          onClick={() => removeFromCart(p.id)}
                          className="p-1 bg-red-100 text-red-600 rounded"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{cart[p.id]}</span>
                        <button
                          onClick={() => addToCart(p.id)}
                          disabled={cart[p.id] >= p.stock}
                          className="p-1 bg-green-100 text-hijau rounded disabled:opacity-30"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => addToCart(p.id)}
                        className="p-2 bg-green-100 text-hijau rounded hover:bg-green-200"
                      >
                        <FaPlus className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-md p-5 sticky top-4">
            <h3 className="text-lg font-semibold text-teks mb-4 flex items-center gap-2">
              <FaShoppingCart className="text-hijau" /> Order Summary
            </h3>

            {cartItems.length === 0 ? (
              <p className="text-gray-400 text-sm">Your cart is empty</p>
            ) : (
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-teks-samping">
                      {item.product_name} x{item.quantity}
                    </span>
                    <span className="font-medium text-teks">
                      Rp {item.total_price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-garis pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-teks-samping">Subtotal</span>
                <span className="font-medium text-teks">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teks-samping">Discount ({discountPercent}% - {profile?.tier})</span>
                <span className="font-medium text-merah">- Rp {discountAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-garis pt-2">
                <span className="text-teks">Total</span>
                <span className="text-hijau">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={submitting || cartItems.length === 0}
              className="w-full mt-4 bg-hijau text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
