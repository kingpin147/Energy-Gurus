"use client";

import React, { useState } from "react";
import { Plus, X, Globe2, Check, MapPin } from "lucide-react";

export const COMMON_PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Gujranwala",
  "Sialkot",
  "Quetta",
  "Sargodha",
  "Bahawalpur",
  "Sahiwal",
  "Abbottabad",
  "Gujrat",
  "Sheikhupura",
  "Kasur",
  "Rahim Yar Khan",
  "Jhelum",
  "Sukkur"
];

interface ServiceAreasInputProps {
  value: string[];
  onChange: (areas: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ServiceAreasInput({
  value = [],
  onChange,
  disabled = false,
  className = ""
}: ServiceAreasInputProps) {
  const [customCity, setCustomCity] = useState("");

  const isAllPakistan = value.includes("All Over Pakistan");

  const toggleAllPakistan = () => {
    if (disabled) return;
    if (isAllPakistan) {
      onChange(value.filter((item) => item !== "All Over Pakistan"));
    } else {
      onChange(["All Over Pakistan", ...value]);
    }
  };

  const toggleCity = (city: string) => {
    if (disabled) return;
    const exists = value.some((c) => c.toLowerCase() === city.toLowerCase());
    if (exists) {
      onChange(value.filter((c) => c.toLowerCase() !== city.toLowerCase()));
    } else {
      onChange([...value, city]);
    }
  };

  const handleAddCustomCity = () => {
    if (disabled) return;
    const trimmed = customCity.trim();
    if (!trimmed) return;
    const exists = value.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      onChange([...value, trimmed]);
    }
    setCustomCity("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomCity();
    }
  };

  const removeCity = (cityToRemove: string) => {
    if (disabled) return;
    onChange(value.filter((c) => c !== cityToRemove));
  };

  return (
    <div className={`service-areas-input space-y-3 ${className}`}>
      {/* "All Over Pakistan" Quick Selection Button */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleAllPakistan}
          disabled={disabled}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
            isAllPakistan
              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
              : "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Globe2 className="w-4 h-4" />
          <span>{isAllPakistan ? "✓ All Over Pakistan Selected" : "Select All Over Pakistan"}</span>
          {isAllPakistan && <Check className="w-3.5 h-3.5" />}
        </button>

        {isAllPakistan && (
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Provides nationwide installation coverage
          </span>
        )}
      </div>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="p-3 bg-slate-50/80 rounded-xl border border-line flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Selected Areas ({value.length}):
          </span>
          {value.map((area, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border shadow-xs transition-colors ${
                area === "All Over Pakistan"
                  ? "bg-emerald-100/80 text-emerald-800 border-emerald-300"
                  : "bg-white text-navy-deep border-line"
              }`}
            >
              <MapPin className="w-3 h-3 text-amber" />
              <span>{area}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeCity(area)}
                  className="hover:text-red-500 rounded-full p-0.5 ml-0.5 transition-colors cursor-pointer"
                  aria-label={`Remove ${area}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}

          {!disabled && value.length > 1 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-bold text-red-600 hover:underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Add Custom City Input */}
      {!disabled && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type city name (e.g. Kasur, Sheikhupura) and press Enter"
            className="flex-1 bg-white border border-line rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber transition-all"
          />
          <button
            type="button"
            onClick={handleAddCustomCity}
            disabled={!customCity.trim()}
            className="px-3.5 py-2 bg-navy-deep hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add City</span>
          </button>
        </div>
      )}

      {/* Quick Select Popular Cities */}
      {!disabled && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-custom block mb-1.5">
            Quick Select Common Cities:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
            {COMMON_PAKISTAN_CITIES.map((city) => {
              const isSelected = value.some((c) => c.toLowerCase() === city.toLowerCase());
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber text-ink font-bold border-amber-600 shadow-xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-line"
                  }`}
                >
                  {isSelected ? `✓ ${city}` : `+ ${city}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

