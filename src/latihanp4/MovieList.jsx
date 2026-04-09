import { useState } from "react";
import moviesData from "./movies.json";
import MovieCard from "./components/MovieCard";

export default function MovieList() {
  const [dataForm, setDataForm] = useState({
    searchTerm: "",
    selectedGenre: "",
    selectedTahun: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm({
      ...dataForm,
      [name]: value,
    });
  };

  const filteredMovies = [...moviesData].filter((movie) => {
    const matchSearch = movie.judul
      .toLowerCase()
      .includes(dataForm.searchTerm.toLowerCase());

    const matchGenre = dataForm.selectedGenre
      ? movie.genre.includes(dataForm.selectedGenre)
      : true;

    const matchTahun = dataForm.selectedTahun
      ? (() => {
          const t = movie.tahun;
          if (dataForm.selectedTahun === "2010-2015") return t >= 2010 && t <= 2015;
          if (dataForm.selectedTahun === "2016-2020") return t >= 2016 && t <= 2020;
          if (dataForm.selectedTahun === "2021-2025") return t >= 2021 && t <= 2025;
          return true;
        })()
      : true;

    return matchSearch && matchGenre && matchTahun;
  });

  const allGenre = ["Action", "Drama", "Sci-Fi", "Comedy", "Thriller", "Horror", "Animation", "Fantasy", "Romance"];

  const inputClass = "bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-8 text-center shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 tracking-tight">
          🎬 Movie Collection
        </h1>
        <p className="text-gray-400 text-sm">Temukan film favoritmu</p>

        {/* Toggle */}
        <div className="flex justify-center gap-2 mt-5">
          <button
            onClick={() => setIsAdmin(false)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              !isAdmin
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            👤 Guest
          </button>
          <button
            onClick={setIsAdmin(true)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              isAdmin
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            🔧 Admin
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            name="searchTerm"
            placeholder="🔍 Cari judul film..."
            value={dataForm.searchTerm}
            onChange={handleChange}
            className={`flex-1 min-w-[200px] ${inputClass}`}
          />
          <select name="selectedGenre" value={dataForm.selectedGenre} onChange={handleChange} className={inputClass}>
            <option value="">🎭 Semua Genre</option>
            {allGenre.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select name="selectedTahun" value={dataForm.selectedTahun} onChange={handleChange} className={inputClass}>
            <option value="">📅 Semua Tahun</option>
            <option value="2010-2015">2010 – 2015</option>
            <option value="2016-2020">2016 – 2020</option>
            <option value="2021-2025">2021 – 2025</option>
          </select>
        </div>

        <p className="text-gray-400 text-xs font-medium mb-4">{filteredMovies.length} film ditemukan</p>

        {/* GUEST — Card Grid */}
        {!isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* ADMIN — Tabel */}
        {isAdmin && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["#", "Judul", "Tahun", "Sutradara", "Genre", "Rating", "Durasi", "Negara", "Pemeran"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{movie.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">{movie.judul}</td>
                    <td className="px-4 py-3 text-gray-500">{movie.tahun}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{movie.sutradara}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {movie.genre.map((g) => (
                          <span key={g} className="bg-indigo-50 text-indigo-500 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">⭐ {movie.rating}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{movie.detail.durasi}</td>
                    <td className="px-4 py-3 text-gray-500">{movie.detail.negara}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{movie.pemeran.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredMovies.length === 0 && (
          <div className="text-center py-24 text-gray-300 font-semibold text-lg">
            😵 Film tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
