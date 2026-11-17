"use client";

import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  icon,
  placeholder = "Chọn một mục",
  className = "",
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + options.length) % options.length,
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0e1017] border transition-all text-xs sm:text-sm cursor-pointer ${
          isOpen
            ? "border-[#7950f2] ring-2 ring-[#7950f2]/30 text-white shadow-lg shadow-purple-600/15"
            : "border-purple-500/25 hover:border-purple-500/60 text-zinc-200 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          {icon && <span className="text-[#9775fa] flex-shrink-0">{icon}</span>}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-purple-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Custom Dropdown Menu Popover */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-60 overflow-y-auto rounded-xl bg-[#161926] border border-purple-500/30 shadow-2xl shadow-black/90 backdrop-blur-xl py-1.5 focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <div
                key={option.value}
                role="option"
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`relative flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#7950f2]/25 text-purple-200 font-semibold"
                    : isHighlighted
                      ? "bg-[#242940] text-white"
                      : "text-zinc-300 hover:bg-[#1f2438] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className="text-purple-400">{option.icon}</span>
                  )}
                  <span className="truncate">{option.label}</span>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#9775fa] flex-shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
