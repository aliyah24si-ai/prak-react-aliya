import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { supabase } from "../../lib/supabase";

export default function AdminProductDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setProduct(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;

  if (!product) {
    return (
      <div className="p-4 text-red-600">
        Produk tidak ditemukan
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Product Detail"
        breadcrumb={["Dashboard", "Products", "Detail"]}
      />

      <div className="mx-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">

          <div className="rounded-xl mb-4 w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {product.name}
          </h2>

          <p className="text-gray-600 mb-1">
            Description: {product.description || "-"}
          </p>

          <p className="text-gray-800 font-semibold text-lg">
            Price: Rp {Number(product.price).toLocaleString("id-ID")}
          </p>

          <p className="text-gray-700 mt-2">
            Stock: {product.stock}
          </p>

          <p className="text-gray-500 mt-2">
            Status: {product.is_active ? (
              <span className="text-green-600 font-semibold">Active</span>
            ) : (
              <span className="text-red-600 font-semibold">Inactive</span>
            )}
          </p>

          <div className="mt-4">
            <Link
              to="/administrator/products"
              className="text-emerald-600 hover:underline text-sm"
            >
              &larr; Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
