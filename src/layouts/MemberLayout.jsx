import { Outlet } from "react-router-dom";
import MemberSidebar from "../components/MemberSidebar";
import Header from "../components/Header";

export default function MemberLayout() {
  return (
    <div id="app-container" className="bg-latar min-h-screen flex">
      <div id="layout-wrapper" className="flex flex-row flex-1">
        <MemberSidebar />
        <div id="main-content" className="flex-1 p-4">
          <Header />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
