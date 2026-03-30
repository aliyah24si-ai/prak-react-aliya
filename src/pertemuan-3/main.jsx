import { createRoot } from "react-dom/client";
import TailwindCSS from "./TailwindCSS";
import "./tailwind.css";
import Typography from "./typography";
import FlexboxGrid from "./FlexBoardGrid";
import UserForm from "./Userform";
import HitungGajiForm from "./HitungGajiForm";

createRoot(document.getElementById("root")).render(
  <div>
    {/* <TailwindCSS />
    <Typography />
    <FlexboxGrid />
    <UserForm /> */}
    <HitungGajiForm />

  </div>
);