export default function ErrorPage({ kodeError, deskripsiError, gambarError }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      {gambarError && (
        <img src={gambarError} alt={`Error ${kodeError}`} className="w-48 mb-6 opacity-80" />
      )}
      <h1 className="text-8xl font-black text-hijau mb-4">{kodeError}</h1>
      <p className="text-xl font-semibold text-teks mb-2">{deskripsiError}</p>
      <p className="text-teks-samping mb-6">Halaman yang kamu cari tidak tersedia.</p>
      <a
        href="/"
        className="bg-hijau text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Kembali ke Dashboard
      </a>
    </div>
  );
}
