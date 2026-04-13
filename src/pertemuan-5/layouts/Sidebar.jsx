import { useState } from "react";
import { FaHome, FaShoppingCart, FaUsers, FaPlus, FaBox, FaChartBar } from "react-icons/fa";

const menuList = [
  { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
  { id: "orders", label: "Orders", icon: <FaShoppingCart /> },
  { id: "customers", label: "Customers", icon: <FaUsers /> },
  { id: "products", label: "Products", icon: <FaBox /> },
  { id: "reports", label: "Reports", icon: <FaChartBar /> },
];

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

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
              <div
                onClick={() => setActiveMenu(menu.id)}
                className={`flex cursor-pointer items-center rounded-xl p-4 font-medium transition-all
                  ${activeMenu === menu.id
                    ? "bg-green-100 text-hijau font-extrabold"
                    : "text-gray-600 hover:bg-green-100 hover:text-hijau hover:font-extrabold"
                  }`}
              >
                <span className="mr-4 text-xl">{menu.icon}</span>
                {menu.label}
              </div>
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
              <span className="text-gray-600 flex items-center font-semibold text-sm">Add Menus</span>
            </div>
          </div>
          <img
            id="footer-avatar"
            src="https://avatar.iran.liara.run/public/28"
            className="w-16 rounded-full"
          />
        </div>
        <span id="footer-brand" className="font-bold text-gray-400 text-sm block">
          Sedap Restaurant Admin Dashboard
        </span>
        <p id="footer-copyright" className="font-light text-gray-400 text-sm mt-1">
          &copy; 2025 All Right Reserved
        </p>
      </div>
    </div>
  );
}
