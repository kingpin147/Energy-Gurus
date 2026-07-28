"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

interface ProjectGalleryProps {
  images: string[];
  videos?: string[];
  name: string;
  autoPlayInterval?: number; // ms, default 4000
}

export function ProjectGallery({ images, videos = [], name, autoPlayInterval = 4000 }: ProjectGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allMedia = [
    ...images.map(url => ({ url, type: "image" as const })),
    ...videos.map(url => ({ url, type: "video" as const }))
  ];

  const total = allMedia.length;

  const next = useCallback(() => {
    if (total > 1) setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total > 1) setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  // Auto-play with pause on hover
  useEffect(() => {
    // Disable auto-play if current is a video
    if (total <= 1 || isHovered || allMedia[current]?.type === "video") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isHovered, next, autoPlayInterval, current, allMedia]);

  if (total === 0) {
    return (
      <div className="w-full h-full bg-paper/10 flex items-center justify-center">
        <ImageIcon className="w-16 h-16 opacity-5" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full group/gallery select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Content */}
      {allMedia.map((media, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {media.type === "image" ? (
            <Image
              src={media.url}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              alt={`${name} — image ${i + 1}`}
            />
          ) : (
            <video
              src={media.url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
        </div>
      ))}

      {/* Gradient overlay for arrows */}
      {total > 1 && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />

          {/* Left arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover/gallery:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </button>

          {/* Right arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover/gallery:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
            aria-label="Next media"
          >
            <ChevronRight className="w-5 h-5 text-slate-800" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {allMedia.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`rounded-full transition-all duration-300 ${i === current
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                aria-label={`Go to media ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
