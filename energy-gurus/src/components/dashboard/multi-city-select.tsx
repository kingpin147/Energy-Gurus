"use client";

import React, { useState } from "react";
import { Globe, Plus, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  "Sukkur",
  "Hyderabad",
  "Okara",
  "Mardan"
];

interface MultiCitySelectProps {
  value: string[] | string;
  onChange: (cities: string[]) => void;
  label?: string;
  description?: string;
  showNationwideOption?: boolean;
  compact?: boolean;
}

export function MultiCitySelect({
  value,
  onChange,
  label = "Cities & Coverage",
  description = "Specify all cities for this project. Select 'All Over Pakistan' for nationwide coverage, or choose multiple specific cities.",
  showNationwideOption = true,
  compact = false
}: MultiCitySelectProps) {
  const [inputVal, setInputVal] = useState("");

  // Normalize value to string array
  const currentCities: string[] = Array.isArray(value)
    ? value.map((c) => String(c).trim()).filter(Boolean)
    : typeof value === "string" && value.trim()
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const isNationwide = currentCities.some(
    (c) => c.toLowerCase() === "all over pakistan" || c.toLowerCase() === "nationwide"
  );

  const handleAddCity = (cityName: string) => {
    const trimmed = cityName.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === "all over pakistan" || trimmed.toLowerCase() === "nationwide") {
      onChange(["All Over Pakistan"]);
      setInputVal("");
      return;
    }

    // Remove nationwide if adding specific city
    const filtered = currentCities.filter(
      (c) => c.toLowerCase() !== "all over pakistan" && c.toLowerCase() !== "nationwide"
    );

    // Prevent duplicates (case-insensitive)
    if (!filtered.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...filtered, trimmed]);
    }
    setInputVal("");
  };

  const handleRemoveCity = (cityName: string) => {
    onChange(currentCities.filter((c) => c.toLowerCase() !== cityName.toLowerCase()));
  };

  const handleToggleNationwide = () => {
    if (isNationwide) {
      onChange([]);
    } else {
      onChange(["All Over Pakistan"]);
    }
  };

  return (
    <div className={`space-y-3 ${compact ? "p-3 bg-white" : "p-4 bg-slate-50/70"} rounded-2xl border border-line`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          {label && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-custom block">
              {label}
            </span>
          )}
          {description && (
            <p className="text-[11px] text-slate-custom mt-0.5">{description}</p>
          )}
        </div>

        {showNationwideOption && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleToggleNationwide}
            className={`rounded-xl text-xs font-bold transition-all shrink-0 gap-1.5 ${
              isNationwide
                ? "bg-teal-700 text-white border-teal-700 hover:bg-teal-800 shadow-xs"
                : "border-teal-700/40 text-teal-800 bg-teal-50 hover:bg-teal-100"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {isNationwide ? "✓ Nationwide Coverage Selected" : "Select All Over Pakistan"}
          </Button>
        )}
      </div>

      {/* Selected Cities Badges */}
      {currentCities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentCities.map((city) => {
            const isNation =
              city.toLowerCase() === "all over pakistan" || city.toLowerCase() === "nationwide";
            return (
              <Badge
                key={city}
                variant="outline"
                className={`text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5 font-bold ${
                  isNation
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-ink border-line shadow-xs"
                }`}
              >
                {isNation ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3 text-amber" />}
                <span>{city}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCity(city)}
                  className={`hover:opacity-75 transition-opacity ${
                    isNation ? "text-white" : "text-slate-400 hover:text-rose-500"
                  }`}
                  title={`Remove ${city}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Input row */}
      {!isNationwide && (
        <>
          <div className="flex gap-2">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCity(inputVal);
                }
              }}
              placeholder="Type city name (e.g. Kasur, Sheikhupura) and press Enter"
              className="h-9 bg-white text-xs border-line rounded-xl flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddCity(inputVal)}
              disabled={!inputVal.trim()}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-slate-700 text-white hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add City
            </Button>
          </div>

          {/* Quick Select Common Cities Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-custom block">
              Quick Select Common Cities:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {COMMON_PAKISTAN_CITIES.map((cName) => {
                const isSelected = currentCities.some(
                  (c) => c.toLowerCase() === cName.toLowerCase()
                );
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveCity(cName);
                      } else {
                        handleAddCity(cName);
                      }
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? "bg-amber text-ink border-amber shadow-xs font-bold"
                        : "bg-white text-slate-custom border-line hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? `✓ ${cName}` : `+ ${cName}`}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

