import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import productsData from "../../data/products.json";

const categoryColor = {
  Beauty: "bg-pink-100 text-pink-700",
  Fragrances: "bg-purple-100 text-purple-700",
  Furniture: "bg-yellow-100 text-yellow-700",
  Groceries: "bg-green-100 text-green-700",
};

export default function Produk() {
  return (
    <div>
      <PageHeader
        title="Produk"
        breadcrumb={["Dashboard", "Produk List"]}
      />

      <div className="mx-4 bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Code", "Title", "Category", "Brand", "Price", "Stock"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {productsData.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-500 text-xs">
                  {p.code}
                </td>

                <td className="px-4 py-3 font-medium text-gray-700">
                  <Link
                    to={`/products/${p.id}`}
                    className="text-emerald-500 hover:text-emerald-600"
                  >
                    {p.title}
                  </Link>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      categoryColor[p.category] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.category}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {p.brand}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  Rp {p.price.toLocaleString("id-ID")}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {p.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}