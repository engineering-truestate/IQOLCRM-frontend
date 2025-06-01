import Tabs from "./design-elements/Tabs";

interface PlatformsProps {
  onPlatformSelect: (platform: string) => void;
}

const Platforms = ({ onPlatformSelect }: PlatformsProps) => {
  const tabs = ["truestate", "acn", "vault"];
  return (
    <div>
      <h3>Platforms</h3>
      <div className="flex gap-2">
        {tabs.map((tab) => {
          return <Tabs key={tab} onClick={() => onPlatformSelect(tab)}>{tab}</Tabs>;
        })}
      </div>
    </div>
  );
};

export default Platforms;
