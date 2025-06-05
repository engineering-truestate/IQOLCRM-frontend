import Tabs from "./design-elements/Tabs";
import Dropdown from "./design-elements/Dropdown";

interface PlatformsProps {
  onPlatformSelect: (platform: string) => void;
}

const Platforms = ({ onPlatformSelect }: PlatformsProps) => {
  const tabs = [
    { label: "Truestate", value: "truestate" },
    { label: "ACN", value: "acn" },
    { label: "Vault", value: "vault" },
    { label: "Canvas Homes", value: "canvas-homes" },
  ];
  return (
    <div>
      <h3>Platforms</h3>
      <Dropdown
        options={tabs}
        onSelect={(platform) => onPlatformSelect(platform)}
      />
    </div>
  );
};

export default Platforms;
