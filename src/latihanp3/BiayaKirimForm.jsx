import { useState } from "react";
import InputField from "./components/InputField";
import SelectField from "./components/SelectField";

export default function BiayaKirimForm() {
  const [berat, setBerat] = useState("");
  const [jarak, setJarak] = useState("");
  const [diskon, setDiskon] = useState("");
  const [layanan, setLayanan] = useState("reguler");
  const [asuransi, setAsuransi] = useState("tidak");
  const [hasil, setHasil] = useState(null);

  // Validasi
  const errorBerat =
    berat === "" ? "Berat wajib diisi." :
    isNaN(berat) ? "Berat harus berupa angka." :
    Number(berat) <= 0 ? "Berat harus lebih dari 0 kg." : "";

  const errorJarak =
    jarak === "" ? "Jarak wajib diisi." :
    isNaN(jarak) ? "Jarak harus berupa angka." :
    Number(jarak) <= 0 ? "Jarak harus lebih dari 0 km." : "";

  const errorDiskon =
    diskon !== "" && isNaN(diskon) ? "Diskon harus berupa angka." :
    diskon !== "" && (Number(diskon) < 0 || Number(diskon) > 100) ? "Diskon harus antara 0–100." : "";

  const semuaValid = errorBerat === "" && errorJarak === "" && errorDiskon === "" && berat !== "" && jarak !== "";

  function hitungBiaya() {
    const koefisien = layanan === "ekspres" ? 10000 : 5000;
    let biaya = Number(berat) * Number(jarak) * koefisien;
    if (asuransi === "ya") biaya = biaya * 1.1;
    if (diskon !== "") biaya = biaya * (1 - Number(diskon) / 100);
    setHasil(Math.round(biaya));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-sky-100 p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border-2 border-purple-100 p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">📦</div>
          <h2 className="text-2xl font-bold text-purple-700">Kalkulator Ongkir</h2>
          <p className="text-purple-400 text-sm mt-1">Estimasi biaya kirim paketmu ✨</p>
        </div>

        {/* Input Berat */}
        <InputField
          label="⚖️ Berat Paket (kg)"
          type="number"
          placeholder="Contoh: 2.5"
          value={berat}
          onChange={(e) => { setBerat(e.target.value); setHasil(null); }}
          error={berat !== "" ? errorBerat : ""}
        />

        
        <InputField
          label="📍 Jarak Pengiriman (km)"
          type="number"
          placeholder="Contoh: 50"
          value={jarak}
          onChange={(e) => { setJarak(e.target.value); setHasil(null); }}
          error={jarak !== "" ? errorJarak : ""}
        />

        
        <InputField
          label="🏷️ Diskon (%) — opsional"
          type="number"
          placeholder="Contoh: 10"
          value={diskon}
          onChange={(e) => { setDiskon(e.target.value); setHasil(null); }}
          error={errorDiskon}
        />

        
        <SelectField
          label="🚚 Layanan Pengiriman"
          value={layanan}
          onChange={(e) => { setLayanan(e.target.value); setHasil(null); }}
          options={[
            { value: "reguler", label: "Reguler — Rp 5.000/km" },
            { value: "ekspres", label: "Ekspres — Rp 10.000/km" },
          ]}
        />

        {/* Select Asuransi */}
        <SelectField
          label="🛡️ Asuransi Paket"
          value={asuransi}
          onChange={(e) => { setAsuransi(e.target.value); setHasil(null); }}
          options={[
            { value: "tidak", label: "Tidak" },
            { value: "ya", label: "Ya (+10%)" },
          ]}
        />

        {/* Tombol hanya muncul kalau semua valid */}
        {semuaValid && (
          <button
            onClick={hitungBiaya}
            className="w-full mt-2 py-3 rounded-2xl font-bold text-white bg-purple-500 hover:bg-purple-600 transition-colors"
          >
            ✨ Hitung Biaya Sekarang!
          </button>
        )}

        {/* Hasil */}
        {hasil !== null && (
          <div className="mt-5 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-xl">
            <p className="font-bold text-purple-700 mb-2">🎉 Rincian Biaya</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>⚖️ Berat: <span className="font-semibold">{berat} kg</span></p>
              <p>📍 Jarak: <span className="font-semibold">{jarak} km</span></p>
              <p>🚚 Layanan: <span className="font-semibold capitalize">{layanan}</span></p>
              <p>🛡️ Asuransi: <span className="font-semibold capitalize">{asuransi}</span></p>
              <p>🏷️ Diskon: <span className="font-semibold">{diskon !== "" ? diskon : 0}%</span></p>
            </div>
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="font-bold text-purple-700">
                Total: <span className="text-pink-600 text-lg">Rp {hasil.toLocaleString("id-ID")}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
