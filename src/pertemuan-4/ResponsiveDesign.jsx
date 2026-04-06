import React from 'react';

export default function ResponsiveDesign() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Demo Responsive Design Tailwind</h1>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">1. Responsive Text</h2>
        <ResponsiveText />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">2. Responsive Width & Flex</h2>
        <ResponsiveWidth />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">3. Responsive Grid Layout</h2>
        <ResponsiveLayout />
      </section>
    </div>
  );
}

function ResponsiveText() {
  return (
    <p className="text-sm md:text-lg lg:text-xl xl:text-2xl mb-4 text-gray-700">
      Coba lakukan zoom in atau zoom out. Perhatikan bahwa ukuran teks akan menyesuaikan dengan ukuran layar.
    </p>
  );
}

function ResponsiveWidth() {
  return (
    <div className="mb-4">
      <p className="mb-2 italic text-gray-600">
        Default: Stacked (Vertikal) | md: Side-by-side (Horizontal)
      </p>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="bg-red-400 w-full md:w-1/2 p-4 text-white text-center rounded">Kolom 1</div>
        <div className="bg-blue-400 w-full md:w-1/2 p-4 text-white text-center rounded">Kolom 2</div>
      </div>
    </div>
  );
}

function ResponsiveLayout() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-blue-500 p-8 text-white text-center rounded-lg shadow-lg">
            Box {i}
          </div>
        ))}
      </div>
    </div>
  );
}