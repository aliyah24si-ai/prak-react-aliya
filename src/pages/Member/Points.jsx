import { useState, useEffect } from "react";
import { FaStar, FaTrophy } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const tierConfig = [
  { tier: "Bronze",   min: 0,    max: 999,   discount: 5,  color: "from-orange-400 to-orange-600" },
  { tier: "Silver",   min: 1000, max: 2999,  discount: 10, color: "from-gray-400 to-gray-600" },
  { tier: "Gold",     min: 3000, max: 6999,  discount: 15, color: "from-yellow-400 to-yellow-600" },
  { tier: "Platinum", min: 7000, max: 999999, discount: 20, color: "from-purple-400 to-purple-600" },
];

export default function Points() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pointHistory, setPointHistory] = useState([]);

  useEffect(() => {
    if (user) loadPoints();
  }, [user]);

  const loadPoints = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("point_transactions")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    setPointHistory(data || []);
    setLoading(false);
  };

  const currentTier = tierConfig.find((t) => t.tier === profile?.tier) || tierConfig[0];
  const nextTier = tierConfig.find((t) => t.min > (profile?.points || 0));

  // Progress to next tier
  let progressPercent = 100;
  let progressLabel = "Max tier reached!";
  if (nextTier) {
    const range = nextTier.min - currentTier.min;
    const current = (profile?.points || 0) - currentTier.min;
    progressPercent = Math.min(100, Math.round((current / range) * 100));
    progressLabel = `${(profile?.points || 0).toLocaleString("id-ID")} / ${nextTier.min.toLocaleString("id-ID")} to ${nextTier.tier}`;
  }

  if (loading) return <LoadingSpinner text="Loading points..." />;

  return (
    <div>
      <PageHeader title="My Points" breadcrumb="Membership & Points" />

      <div className="px-5 grid lg:grid-cols-2 gap-6 mb-6">
        {/* Tier Card */}
        <div className={`bg-gradient-to-r ${currentTier.color} rounded-2xl shadow-lg p-6 text-white`}>
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="text-2xl" />
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Current Tier</p>
              <p className="text-3xl font-bold">{currentTier.tier}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs opacity-70">Total Points</p>
              <p className="text-2xl font-bold">{(profile?.points || 0).toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Active Discount</p>
              <p className="text-2xl font-bold">{currentTier.discount}%</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-teks mb-2">Tier Progress</h3>
          <p className="text-sm text-teks-samping mb-4">{progressLabel}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-hijau h-4 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Tier breakpoints */}
          <div className="flex justify-between text-xs text-teks-samping">
            {tierConfig.map((t) => (
              <div key={t.tier} className={`text-center ${profile?.tier === t.tier ? "font-bold text-hijau" : ""}`}>
                <p>{t.tier}</p>
                <p>{t.min.toLocaleString("id-ID")}+</p>
              </div>
            ))}
          </div>

          {/* Tier benefits */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-teks">Tier Benefits:</p>
            {tierConfig.map((t) => (
              <div key={t.tier} className={`flex justify-between text-sm py-1 ${profile?.tier === t.tier ? "font-bold text-hijau" : "text-teks-samping"}`}>
                <span>{t.tier} ({t.min.toLocaleString("id-ID")}+ pts)</span>
                <span>Discount {t.discount}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Point History */}
      <div className="px-5">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-teks mb-4 flex items-center gap-2">
            <FaStar className="text-kuning" /> Point Transaction History
          </h3>

          {pointHistory.length === 0 ? (
            <EmptyState text="No point transactions yet. Complete an order to earn points!" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-garis text-teks-samping">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis">
                  {pointHistory.map((pt) => (
                    <tr key={pt.id} className="hover:bg-gray-50">
                      <td className="py-3 text-teks-samping text-xs">
                        {new Date(pt.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 text-teks">{pt.description}</td>
                      <td className="py-3 text-right">
                        <span className="text-hijau font-bold">+{pt.points_earned} pts</span>
                      </td>
                    </tr>
                  ))}

                  {/* Total row */}
                  <tr className="border-t-2 border-garis">
                    <td className="py-3 font-bold text-teks" colSpan={2}>Total Points</td>
                    <td className="py-3 text-right font-bold text-hijau text-base">
                      {(profile?.points || 0).toLocaleString("id-ID")} pts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
