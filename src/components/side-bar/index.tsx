import Platforms from "../Platforms";
import { useState } from "react";
import { acnMenuItems } from "./menu-options/acn";
import { canvasHomesMenuItems } from "./menu-options/canvas-homes";
import { truestateMenuItems } from "./menu-options/truestate";
import { vaultMenuItems } from "./menu-options/vault";

interface MenuItem {
  label: string;
  path: string;
}

const Sidebar = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
  };

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
      <ul>
        {menuItems.map((item) => (
          <li key={item.label}>
            <a href={item.path}>{item.label}</a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <Platforms onPlatformSelect={handlePlatformSelect} />
      {renderMenuItems()}
    </div>
  );
};

export default Sidebar