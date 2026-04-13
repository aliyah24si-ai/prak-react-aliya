export default function StatCard({ icon, count, label, iconBg }) {
  return (
    <div className="flex items-center space-x-5 bg-white rounded-lg shadow-md p-4">
      <div className={`${iconBg} rounded-full p-4`}>
        <span className="text-3xl text-white">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-teks">{count}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
    </div>
  );
}
