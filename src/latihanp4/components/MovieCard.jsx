export default function MovieCard({ movie }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-gray-100">
      <div className="relative">
        <img
          src={movie.gambar}
          alt={movie.judul}
          className="w-full h-44 object-cover"
          onError={(e) => { e.target.src = "https://placehold.co/300x400?text=No+Image"; }}
        />
        <span className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow">
          ⭐ {movie.rating}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-gray-900 font-bold text-xs leading-snug mb-1">{movie.judul}</h3>
        <p className="text-gray-400 text-[11px] mb-1">{movie.tahun} · {movie.sutradara}</p>
        <p className="text-gray-400 text-[11px] mb-2">{movie.detail.durasi} · {movie.detail.negara}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {movie.genre.map((g) => (
            <span key={g} className="bg-indigo-50 text-indigo-500 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
              {g}
            </span>
          ))}
        </div>
        <p className="text-gray-400 text-[10px] truncate">🎬 {movie.pemeran.slice(0, 2).join(", ")}</p>
      </div>
    </div>
  );
}
