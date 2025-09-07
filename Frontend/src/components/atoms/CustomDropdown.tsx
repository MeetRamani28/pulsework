"use client";
import React, { useState, useRef, useEffect } from "react";

export interface DropdownProps {
  options: { label: string; value: string }[];
  selected: string | string[]; // single or multi
  onSelect?: (value: string) => void; // for single select
  onSelectMulti?: (values: string[]) => void; // for multi select
  multi?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<DropdownProps> = ({
  options,
  selected,
  onSelect,
  onSelectMulti,
  multi = false,
  placeholder,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine label to show
  const selectedLabel = multi
    ? (selected as string[]).length > 0
      ? `${(selected as string[]).length} selected`
      : placeholder || "Select..."
    : options.find((o) => o.value === selected)?.label ||
      placeholder ||
      "Select...";

  const handleSelect = (value: string) => {
    if (disabled) return;
    if (multi && onSelectMulti) {
      let newSelected: string[] = Array.isArray(selected) ? [...selected] : [];
      if (newSelected.includes(value)) {
        newSelected = newSelected.filter((v) => v !== value);
      } else {
        newSelected.push(value);
      }
      onSelectMulti(newSelected);
    } else if (!multi && onSelect) {
      onSelect(value);
      setOpen(false); // close dropdown on single select
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className="w-full px-3 py-2 border rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedLabel}
        <span className="ml-2">&#9662;</span>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-3 py-2 hover:bg-blue-100 cursor-pointer flex items-center ${
                multi &&
                Array.isArray(selected) &&
                selected.includes(option.value)
                  ? "bg-blue-50 font-medium"
                  : ""
              }`}
            >
              {multi && (
                <input
                  type="checkbox"
                  readOnly
                  checked={
                    Array.isArray(selected) && selected.includes(option.value)
                  }
                  className="mr-2"
                />
              )}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
