import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import productsData from "../../data/products.json";

export default function ProductDetail() {
  const { id } = useParams();

  const product = productsData.find(
    (p) => p.id === Number(id)
  );

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
        breadcrumb={["Dashboard", "Produk", "Detail"]}
      />

      <div className="mx-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">

          <div className="rounded-xl mb-4 w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {product.title}
          </h2>

          <p className="text-gray-600 mb-1">
            Kategori: {product.category}
          </p>

          <p className="text-gray-600 mb-1">
            Brand: {product.brand}
          </p>

          <p className="text-gray-800 font-semibold text-lg">
            Harga: Rp {product.price.toLocaleString("id-ID")}
          </p>

          <p className="text-gray-700 mt-2">
            Stock: {product.stock}
          </p>

          <p className="text-gray-500 mt-2">
            Code: {product.code}
          </p>

        </div>
      </div>
    </div>
  );
}