import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";

export default function AdminLayout() {
  return (
    <div id="app-container" className="bg-latar min-h-screen flex">
      <div id="layout-wrapper" className="flex flex-row flex-1">
        <AdminSidebar />
        <div id="main-content" className="flex-1 p-4">
          <Header />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
