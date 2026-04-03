export default function InputField({ label, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-4">
      <label className="block text-purple-700 font-semibold mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border-2 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none ${
          error ? "border-pink-400 bg-pink-50" : "border-purple-200"
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-pink-600 bg-pink-50 border-l-4 border-pink-400 px-2 py-1 rounded">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
