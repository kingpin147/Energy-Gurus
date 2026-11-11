"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  MessageSquare,
  FileText,
  Briefcase,
  Building2,
  Star,
  ArrowRight,
  Radio,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface LiveActivityItem {
  id: string;
  type: "inquiry" | "article" | "epc" | "brand" | "review";
  text: string;
  time: string | Date;
  href: string;
}

interface LiveActivityStreamProps {
  initialActivities: LiveActivityItem[];
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_CONFIG = {
  inquiry: {
    label: "Lead",
    icon: MessageSquare,
    badge: "bg-amber/10 text-amber border-amber/20",
    dot: "bg-amber",
  },
  article: {
    label: "Editorial",
    icon: FileText,
    badge: "bg-teal/10 text-teal border-teal/20",
    dot: "bg-teal",
  },
  epc: {
    label: "Installer",
    icon: Briefcase,
    badge: "bg-navy-deep/10 text-navy-deep border-navy-deep/20",
    dot: "bg-navy-deep",
  },
  brand: {
    label: "Partner",
    icon: Building2,
    badge: "bg-amber-deep/10 text-amber-deep border-amber-deep/20",
    dot: "bg-amber-deep",
  },
  review: {
    label: "Review",
    icon: Star,
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
};

export function LiveActivityStream({ initialActivities }: LiveActivityStreamProps) {
  const [activities, setActivities] = useState<LiveActivityItem[]>(initialActivities);
  const [pulse, setPulse] = useState(false);

  // Periodic subtle heartbeat animation simulating incoming telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border border-line shadow-xs rounded-2xl bg-white overflow-hidden hover:border-amber/40 hover:shadow-sm transition-all duration-200">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={cn("w-4 h-4 text-emerald-600 transition-transform", pulse && "scale-125")} />
          <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
            Real-Time Activity Stream
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-ibm-plex-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Ticker</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-line/60 max-h-[360px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-custom font-ibm-plex-mono">
              Waiting for live platform events...
            </div>
          ) : (
            activities.map((item, idx) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.inquiry;
              const Icon = cfg.icon;

              return (
                <Link
                  key={item.id || idx}
                  href={item.href}
                  className="p-3.5 flex items-center justify-between hover:bg-paper/50 transition-colors group text-xs font-sans block"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className={cn("p-1.5 rounded-lg shrink-0 border", cfg.badge)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("text-[9.5px] font-bold font-ibm-plex-mono uppercase px-1.5 py-0.2 rounded-md border", cfg.badge)}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-ibm-plex-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {timeAgo(item.time)}
                        </span>
                      </div>
                      <p className="font-semibold text-navy-deep truncate text-xs group-hover:text-amber transition-colors">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

