import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaShoppingCart, FaPlusCircle, FaStar, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const menuList = [
  { id: "dashboard",    label: "Dashboard",    icon: <FaHome />,        to: "/member/dashboard" },
  { id: "create-order", label: "Create Order", icon: <FaPlusCircle />,  to: "/member/create-order" },
  { id: "orders",       label: "My Orders",    icon: <FaShoppingCart />, to: "/member/orders" },
  { id: "points",       label: "My Points",    icon: <FaStar />,        to: "/member/points" },
];

const menuClass = ({ isActive }) =>
  `flex cursor-pointer items-center rounded-xl p-4 space-x-2 transition-all
  ${isActive
    ? "text-hijau bg-green-200 font-extrabold"
    : "text-gray-600 hover:text-hijau hover:bg-green-200 hover:font-extrabold"
  }`;

const tierColors = {
  Bronze:   "text-orange-600",
  Silver:   "text-gray-500",
  Gold:     "text-yellow-500",
  Platinum: "text-purple-600",
};

export default function MemberSidebar() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div id="sidebar" className="flex min-h-screen w-72 flex-col bg-white p-10 shadow-lg">
      {/* Logo */}
      <div id="sidebar-logo" className="flex flex-col">
        <span id="logo-title" className="font-poppins text-[48px] text-gray-900 leading-tight">
          Sedap<b id="logo-dot" className="text-hijau">.</b>
        </span>
        <span id="logo-subtitle" className="font-semibold text-gray-400 font-barlow">
          Member Portal
        </span>
      </div>

      {/* Membership Badge */}
      {profile && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Membership</p>
          <p className={`text-xl font-bold mt-1 ${tierColors[profile.tier] || "text-gray-600"}`}>
            {profile.tier}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <b>{profile.points?.toLocaleString("id-ID") || 0}</b> Points
          </p>
        </div>
      )}

      {/* List Menu */}
      <div id="sidebar-menu" className="mt-8">
        <ul id="menu-list" className="space-y-3">
          {menuList.map((menu) => (
            <li key={menu.id}>
              <NavLink to={menu.to} className={menuClass}>
                <span className="text-xl">{menu.icon}</span>
                <span>{menu.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div id="sidebar-footer" className="mt-auto">
        <div id="footer-card" className="bg-hijau px-4 py-3 rounded-md shadow-lg mb-6 flex items-center gap-3">
          <div id="footer-text" className="text-white text-sm flex-1">
            <span>Hello, <b>{profile?.full_name || "Member"}</b></span>
            <button
              onClick={handleLogout}
              className="flex justify-center items-center w-full p-2 mt-3 bg-white rounded-md space-x-2 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <FaSignOutAlt className="text-gray-600" />
              <span className="text-gray-600 font-semibold text-sm">Logout</span>
            </button>
          </div>
          <img src="https://avatar.iran.liara.run/public/28" className="w-16 rounded-full" alt="avatar" />
        </div>
        <span className="font-bold text-gray-400 text-sm block">Sedap Member Portal</span>
        <p className="font-light text-gray-400 text-sm mt-1">&copy; 2025 All Right Reserved</p>
      </div>
    </div>
  );
}
