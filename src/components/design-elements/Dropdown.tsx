import React, { useState, useRef, useEffect } from "react";

interface DropdownProps {
  options: { label: string; value: string }[];
  onSelect: (option: string) => void;
  defaultValue?: string;
}

const Dropdown = ({ options, onSelect, defaultValue }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(defaultValue || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || "Select a platform";


  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") setIsOpen((open) => !open);
    if (e.key === "Escape") setIsOpen(false);
  };

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div
      className="relative w-64"
      tabIndex={0}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <div
        className="border px-4 py-2 rounded cursor-pointer bg-white shadow"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedLabel}</span>
        <span className="float-right">&#9662;</span>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selected === option.value ? "bg-gray-100 font-bold" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;