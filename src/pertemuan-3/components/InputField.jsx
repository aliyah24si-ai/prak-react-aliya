export default function InputField({ label, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 bg-red-50 border-l-4 border-red-400 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}