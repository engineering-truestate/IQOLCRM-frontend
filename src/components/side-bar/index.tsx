import Platforms from "../Platforms";
import { useState } from "react";
import { acnMenuItems } from "./menu-options/acn";
import { canvasHomesMenuItems } from "./menu-options/canvas-homes";
import { truestateMenuItems } from "./menu-options/truestate";
import { vaultMenuItems } from "./menu-options/vault";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
}

const Sidebar = () => {
  const DEFAULT_PLATFORM = import.meta.env.VITE_PLATFORM || 'canvas-homes';
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(DEFAULT_PLATFORM);
  const navigate = useNavigate();




  const renderMenuItems = () => {
    let menuItems: MenuItem[];
    switch (selectedPlatform) {
      case "acn":
        menuItems = acnMenuItems;
        break;
      case "canvas-homes":
        menuItems = canvasHomesMenuItems;
        break;
      case "truestate":
        menuItems = truestateMenuItems;
        break;
      case "vault":
        menuItems = vaultMenuItems;
        break;
      default:
        menuItems = [];
    }

    return (
    <nav className="flex-1 mt-2">
        <ul className="flex flex-col">
          {menuItems.map((item) => (
            <li key={item.label}>
              <div
                className=
                  "flex items-center gap-3 px-6 py-2 rounded-md cursor-pointer font-medium text-base transition"
                onClick={() => navigate(item.path)}
              >
                {/* <img src={item.icon} alt={item.label} className="w-5 h-5" /> */}
                <span>{item.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div className="flex flex-col w-[280px] min-h-screen h-full bg-[#F7F7F7] border-r border-[#ececec]">
      <div className="mt-auto px-6 py-4">
        <Platforms onPlatformSelect={setSelectedPlatform} />
      </div>
      {renderMenuItems()}
    </div>
  );
};

export default Sidebar