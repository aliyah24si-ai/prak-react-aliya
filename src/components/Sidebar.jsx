import { NavLink } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUsers, FaPlus, FaBox, FaChartBar, FaExclamationTriangle } from "react-icons/fa";

const menuList = [
  { id: "dashboard", label: "Dashboard", icon: <FaHome />, to: "/" },
  { id: "orders", label: "Orders", icon: <FaShoppingCart />, to: "/orders" },
  { id: "customers", label: "Customers", icon: <FaUsers />, to: "/customers" },
  { id: "products", label: "Products", icon: <FaBox />, to: "/products" },
  { id: "reports", label: "Reports", icon: <FaChartBar />, to: "/reports" },
];

const errorMenuList = [
  { label: "Error 400", to: "/error-400" },
  { label: "Error 401", to: "/error-401" },
  { label: "Error 403", to: "/error-403" },
];

const menuClass = ({ isActive }) =>
  `flex cursor-pointer items-center rounded-xl p-4 space-x-2 transition-all
  ${isActive
    ? "text-hijau bg-green-200 font-extrabold"
    : "text-gray-600 hover:text-hijau hover:bg-green-200 hover:font-extrabold"
  }`;

export default function Sidebar() {
  return (
    <div id="sidebar" className="flex min-h-screen w-72 flex-col bg-white p-10 shadow-lg">

      {/* Logo */}
      <div id="sidebar-logo" className="flex flex-col">
        <span id="logo-title" className="font-poppins text-[48px] text-gray-900 leading-tight">
          Sedap<b id="logo-dot" className="text-hijau">.</b>
        </span>
        <span id="logo-subtitle" className="font-semibold text-gray-400 font-barlow">
          Modern Admin Dashboard
        </span>
      </div>

      {/* List Menu */}
      <div id="sidebar-menu" className="mt-10">
        <ul id="menu-list" className="space-y-3">
          {menuList.map((menu) => (
            <li key={menu.id}>
              <NavLink to={menu.to} className={menuClass} end={menu.to === "/"}>
                <span className="text-xl">{menu.icon}</span>
                <span>{menu.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Error Menu */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-6 mb-2 px-4">Error Pages</p>
        <ul className="space-y-2">
          {errorMenuList.map((menu) => (
            <li key={menu.to}>
              <NavLink to={menu.to} className={menuClass}>
                <span className="text-xl"><FaExclamationTriangle /></span>
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
            <span>Please organize your menus through button below!</span>
            <div id="add-menu-button" className="flex justify-center items-center p-2 mt-3 bg-white rounded-md space-x-2 cursor-pointer">
              <FaPlus className="text-gray-600" />
              <span className="text-gray-600 font-semibold text-sm">Add Menus</span>
            </div>
          </div>
          <img src="https://avatar.iran.liara.run/public/28" className="w-16 rounded-full" />
        </div>
        <span className="font-bold text-gray-400 text-sm block">Sedap Restaurant Admin Dashboard</span>
        <p className="font-light text-gray-400 text-sm mt-1">&copy; 2025 All Right Reserved</p>
      </div>
    </div>
  );
}
