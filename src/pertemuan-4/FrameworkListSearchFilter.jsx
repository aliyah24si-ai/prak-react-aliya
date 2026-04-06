import frameworkData from "./framework.json";
import { useState } from "react";

export default function FrameworkListSearchFilter() {
  /*Deklarasi state untuk search term dan selected tag*/

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  /*logic untuk filter data berdasarkan search term dan selected tag*/
  const _searchTerm = searchTerm.toLowerCase();
  const filteredFrameworks = frameworkData.filter((framework) => {
    const matchesSearch =
      framework.name.toLowerCase().includes(_searchTerm) ||
      framework.description.toLowerCase().includes(_searchTerm) ||
      framework.details.developer.toLowerCase().includes(_searchTerm);

    const matchesTag = selectedTag
      ? framework.tags.includes(selectedTag)
      : true;

    return matchesSearch && matchesTag;
  });

  /** Deklarasi pengambilan unique tags di frameworkData **/
const allTags = [
    ...new Set(frameworkData.flatMap((framework) => framework.tags)),
  ];


  return (
    <div className="min-h-screen bg-pink-50 p-8 font-sans">
      {/* Header Lucu */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-pink-500 mb-2">
          ✨ My Frameworks ✨
        </h1>
        <p className="text-gray-500 italic">
          Koleksi teknologi favorit yang super keren!
        </p>
      </div>
      <input
        type="text"
        name="searchTerm"
        placeholder="Search framework..."
        className="w-full p-2 border border-gray-300 rounded mb-4"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        name="selectedTag"
        className="w-full p-2 border border-gray-300 rounded mb-4"
        onChange={(e) => setSelectedTag(e.target.value)}
      >
        <option value="">All Tags</option>
        {allTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredFrameworks.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border-2 border-pink-100 p-6 rounded-3xl shadow-xl 
                       hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Dekorasi Bulatan di Background */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-100 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>

            <div className="relative z-10">
              {/* Judul & Developer */}
              <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-pink-500 transition-colors">
                {item.name}
              </h2>
              <p className="text-xs font-bold tracking-widest uppercase text-indigo-400 mb-3">
                👩‍💻 {item.details.developer}
              </p>

              {/* Deskripsi */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Website Button */}
              <a
                href={item.details.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-6 text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 
                           px-4 py-2 rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-md"
              >
                Visit Website 🚀
              </a>

              {/* Tags dengan warna warni pastel */}
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-indigo-50 border border-indigo-100 text-indigo-500 px-3 py-1 
                               text-[10px] font-bold rounded-full uppercase tracking-tighter"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
