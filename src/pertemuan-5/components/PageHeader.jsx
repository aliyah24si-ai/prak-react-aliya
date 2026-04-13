export default function PageHeader({ title, current, onAdd }) {
  return (
    <div id="pageheader-container" className="flex items-center justify-between p-4">
      <div id="pageheader-left" className="flex flex-col">
        <span id="page-title" className="text-3xl font-semibold text-teks">
          {title || "Dashboard"}
        </span>
        <div id="breadcrumb-links" className="flex items-center font-medium space-x-2 mt-2">
          <span id="breadcrumb-home" className="text-gray-500">Dashboard</span>
          <span id="breadcrumb-separator" className="text-gray-500">/</span>
          <span id="breadcrumb-current" className="text-gray-500">{current || "Overview"}</span>
        </div>
      </div>
      <div id="action-button">
        <button
          id="add-button"
          onClick={onAdd}
          className="bg-hijau text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add New
        </button>
      </div>
    </div>
  );
}
