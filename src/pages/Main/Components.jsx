import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Avatar from "../../components/Avatar";
import Container from "../../components/Container";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import ProductCard from "../../components/ProductCard";
import Table from "../../components/Table";

export default function Components() {
  const headers = [
  "No",
  "Nama Produk",
  "Kategori",
  "Harga",
  "Aksi"
];
  const products = [
    {
      id: 1,
      name: "Laptop Asus",
      category: "Elektronik",
      price: "Rp 8.000.000",
    },
    {
      id: 2,
      name: "Sepatu Sport",
      category: "Fashion",
      price: "Rp 450.000",
    },
    {
      id: 3,
      name: "Jam Tangan",
      category: "Aksesoris",
      price: "Rp 799.000",
    },
  ];
  return (
    <>
      <Container className="bg-gray-100">
        <PageHeader title="Components" />
        <Card>
          <h2 className="text-xl font-bold">Judul Card</h2>
          <p className="text-gray-600">Ini adalah isi dari card.</p>
          <p>Ini Halaman Componenets</p>
          <div className="mb-3">
            <Button>Simpan</Button>
            <Button type="danger">Hapus</Button>
            <Button type="secondary">Edit</Button>
            <Button type="warning">Cetak</Button>
          </div>

          <div className="mb-3 flex gap-2">
            <Badge>Berhasil!</Badge>
            <Badge type="success">Success</Badge>
            <Badge type="danger">Error</Badge>
            <Badge type="warning">Warning</Badge>
          </div>

          <div className="mb-3 flex gap-2">
            <Avatar name="Budi" />
            <Avatar name="Siti" />
          </div>

          <ProductCard
            image="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
            title="Sepatu Sport"
            category="Fashion"
            price="Rp 450.000"
            description="Sepatu sport modern dengan desain nyaman dan ringan untuk aktivitas sehari-hari."
          />

          <ProductCard
            image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
            title="Smartphone"
            category="Elektronik"
            price="Rp 4.500.000"
            description="Smartphone dengan performa cepat, kamera jernih, dan baterai tahan lama."
          />

          <Table headers={headers}>
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="border px-4 py-3">{index + 1}</td>

                <td className="border px-4 py-3">{product.name}</td>

                <td className="border px-4 py-3">{product.category}</td>

                <td className="border px-4 py-3">{product.price}</td>

                <td className="border px-4 py-3">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded">
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
