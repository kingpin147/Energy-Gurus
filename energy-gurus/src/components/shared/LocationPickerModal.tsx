"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Search,
  Crosshair,
  Check,
  Loader2,
  ExternalLink,
  Navigation,
  Building2,
  Map as MapIcon
} from "lucide-react";
import { toast } from "sonner";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoordinates?: string;
  defaultCity?: string;
  locationLabel?: string;
  onSave: (coordinates: string) => void;
}

const PAKISTAN_CITIES: Record<string, [number, number]> = {
  Lahore: [31.5204, 74.3587],
  Karachi: [24.8607, 67.0011],
  Islamabad: [33.6844, 73.0479],
  Rawalpindi: [33.5651, 73.0169],
  Faisalabad: [31.4504, 73.135],
  Sialkot: [32.4945, 74.5229],
  Multan: [30.1575, 71.5249],
  Peshawar: [34.0151, 71.5249],
  Gujranwala: [32.1877, 74.1945],
  Quetta: [30.1798, 66.975],
};

export function LocationPickerModal({
  isOpen,
  onClose,
  initialCoordinates,
  defaultCity,
  locationLabel = "Office Location",
  onSave,
}: LocationPickerModalProps) {
  const [lat, setLat] = useState<number>(31.5204);
  const [lng, setLng] = useState<number>(74.3587);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mapInstance: any = null;
    let markerInstance: any = null;

    const setup = async () => {
      // Load Leaflet dynamically to prevent Next.js SSR errors
      const L = (await import("leaflet")).default;

      // Ensure CSS is injected
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Fix missing marker icons in Next.js bundler
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Determine initial coordinates
      let startLat = 31.5204;
      let startLng = 74.3587;

      if (initialCoordinates) {
        const parts = initialCoordinates.split(",").map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          startLat = parts[0];
          startLng = parts[1];
        }
      } else if (defaultCity) {
        const matched = Object.entries(PAKISTAN_CITIES).find(([cityName]) =>
          defaultCity.toLowerCase().includes(cityName.toLowerCase())
        );
        if (matched) {
          startLat = matched[1][0];
          startLng = matched[1][1];
        }
      }

      setLat(Number(startLat.toFixed(6)));
      setLng(Number(startLng.toFixed(6)));

      if (mapContainerRef.current) {
        mapInstance = L.map(mapContainerRef.current).setView([startLat, startLng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        markerInstance = L.marker([startLat, startLng], { draggable: true }).addTo(mapInstance);
        markerInstance.bindPopup(`<b>${locationLabel}</b><br/>Drag pin or click map to move`).openPopup();

        markerInstance.on("dragend", () => {
          const pos = markerInstance.getLatLng();
          setLat(Number(pos.lat.toFixed(6)));
          setLng(Number(pos.lng.toFixed(6)));
        });

        mapInstance.on("click", (e: any) => {
          markerInstance.setLatLng(e.latlng);
          setLat(Number(e.latlng.lat.toFixed(6)));
          setLng(Number(e.latlng.lng.toFixed(6)));
        });

        mapRef.current = mapInstance;
        markerRef.current = markerInstance;

        // Invalidate map size after modal animation finishes
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 300);
      }
    };

    setup();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, initialCoordinates, defaultCity, locationLabel]);

  const setLocation = (newLat: number, newLng: number, zoom = 15) => {
    setLat(Number(newLat.toFixed(6)));
    setLng(Number(newLng.toFixed(6)));
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapRef.current.setView([newLat, newLng], zoom);
      markerRef.current.openPopup();
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = searchQuery.toLowerCase().includes("pakistan")
        ? searchQuery
        : `${searchQuery}, Pakistan`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        setLocation(foundLat, foundLng, 16);
        toast.success(`Found: ${data[0].display_name.split(",").slice(0, 3).join(",")}`);
      } else {
        toast.error("Location not found. Try entering a city or society name.");
      }
    } catch {
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGeolocating(false);
        const curLat = position.coords.latitude;
        const curLng = position.coords.longitude;
        setLocation(curLat, curLng, 16);
        toast.success("Location updated to your current GPS position");
      },
      (error) => {
        setIsGeolocating(false);
        toast.error(error.message || "Unable to retrieve your current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    onSave(coords);
    toast.success(`Pinned location: ${coords}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white text-ink border border-line rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-navy-deep text-white p-5 flex items-center justify-between border-b border-navy-soft">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber rounded-lg text-ink font-bold">
                <MapPin className="w-4 h-4 text-white" />
              </span>
              <DialogTitle className="text-lg font-bold font-fraunces text-white">
                Pin Exact Location on Map
              </DialogTitle>
            </div>
            <DialogDescription className="text-paper/70 text-xs mt-1">
              Click anywhere on the map or drag the pin marker to set the exact coordinates for {locationLabel}.
            </DialogDescription>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Search bar & GPS button */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, area, or society (e.g. DHA Phase 4, Lahore)..."
                  className="pl-9 h-10 text-xs bg-slate-50 border-line rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="bg-navy-deep hover:bg-ink text-white text-xs font-bold h-10 px-4 rounded-xl gap-1.5"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Search
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              disabled={isGeolocating}
              onClick={handleUseCurrentLocation}
              className="w-full sm:w-auto h-10 text-xs font-bold rounded-xl border-line text-slate-700 hover:text-ink gap-1.5"
            >
              {isGeolocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5 text-amber" />}
              Use My GPS
            </Button>
          </div>

          {/* Quick city jump pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-custom uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" /> Jump to:
            </span>
            {Object.entries(PAKISTAN_CITIES).map(([city, [cLat, cLng]]) => (
              <button
                key={city}
                type="button"
                onClick={() => setLocation(cLat, cLng, 14)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber/20 hover:text-amber-deep text-slate-700 font-semibold text-[11px] transition-colors whitespace-nowrap cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>

          {/* Map Container */}
          <div className="relative rounded-xl overflow-hidden border border-line shadow-inner">
            <div
              ref={mapContainerRef}
              className="w-full h-[360px] bg-slate-100 z-10"
              style={{ minHeight: "360px" }}
            />
            <div className="absolute top-2 right-2 z-[400] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-line text-[11px] font-semibold text-slate-700 shadow-sm pointer-events-none">
              👆 Click map or drag pin
            </div>
          </div>

          {/* Coordinates readout and manual adjust */}
          <div className="bg-slate-50 border border-line rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-custom">Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setLocation(v, lng, mapRef.current?.getZoom() || 15);
                  }}
                  className="h-8 text-xs bg-white border-line rounded-lg w-full sm:w-36 font-mono font-bold"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-custom">Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setLocation(lat, v, mapRef.current?.getZoom() || 15);
                  }}
                  className="h-8 text-xs bg-white border-line rounded-lg w-full sm:w-36 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={`https://maps.google.com/?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-custom hover:text-amber-deep flex items-center gap-1 font-semibold underline"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-line p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-custom font-medium">
            Selected: <span className="font-mono font-bold text-ink">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-bold rounded-xl border-line"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="h-9 px-5 text-xs font-bold rounded-xl bg-amber hover:bg-amber-deep text-ink gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save Pin Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

