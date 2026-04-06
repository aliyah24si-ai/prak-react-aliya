import { createRoot } from "react-dom/client";
import "./tailwind.css";
import frameworkData from "./framework.json";
import FrameworkList from "./FrameworkList";
import FrameworkListSearchFilter from "./FrameworkListSearchFilter";

createRoot(document.getElementById("root")).render(
  <div>
    {/* <FrameworkList/> */}
    <FrameworkListSearchFilter />
  </div>
);