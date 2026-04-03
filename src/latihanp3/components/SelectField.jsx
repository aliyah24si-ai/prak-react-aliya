export default function SelectField({ label, value, onChange, options }) {
  return (
    <div className="mb-4">
      <label className="block text-purple-700 font-semibold mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full p-2 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
