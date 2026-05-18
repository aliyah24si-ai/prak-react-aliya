import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Avatar from "../../components/Avatar";
import Container from "../../components/Container";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import ProductCard from "../../components/ProductCard";

export default function Components() {
  return (
<>
<Container className="bg-gray-100">
      <PageHeader title="Components" />
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


<Card>
		<h2 className="text-xl font-bold">Judul Card</h2>
		<p className="text-gray-600">Ini adalah isi dari card.</p>
</Card>

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

  
</Container>
<Footer />
</>
  );
}
