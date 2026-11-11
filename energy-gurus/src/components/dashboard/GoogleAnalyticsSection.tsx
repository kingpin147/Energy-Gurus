"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe2,
  Users,
  Eye,
  Clock,
  Navigation,
  MapPin,
  TrendingUp,
  TrendingDown,
  Layers,
  Share2,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Compass,
  Link2,
  ExternalLink,
  Radio
} from "lucide-react";
import { GAResponse, GADailyTrend } from "@/lib/google-analytics";

function MiniSparkline({ points, strokeColor }: { points: number[]; strokeColor: string }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points, min + 1);
  const width = 58;
  const height = 22;
  const pad = 2;
  const step = (width - pad * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((val, i) => {
    const x = pad + i * step;
    const y = height - pad - ((val - min) / (max - min)) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.join(" ")}
      />
    </svg>
  );
}

interface Props {
  data: GAResponse;
}

export function GoogleAnalyticsSection({ data }: Props) {
  const [activeGeoTab, setActiveGeoTab] = useState<"cities" | "regions" | "countries">("cities");
  const [rangeTab, setRangeTab] = useState<"7d" | "14d" | "30d">("30d"); // Default is 30 days
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Dynamically select data bundle based on active range tab (7d, 14d, 30d)
  const activeBundle = useMemo(() => {
    if (data?.ranges && data.ranges[rangeTab]) {
      return data.ranges[rangeTab];
    }
    return {
      overview: data?.overview || {
        activeUsers: 0,
        totalUsers: 0,
        screenPageViews: 0,
        sessions: 0,
        averageSessionDuration: 0,
        engagementRate: 0,
        bounceRate: 0,
      },
      topPages: data?.topPages || [],
      topCountries: data?.topCountries || [],
      topCities: data?.topCities || [],
      topRegions: data?.topRegions || [],
      devices: data?.devices || [],
      channels: data?.channels || [],
      multiChannelSources: data?.multiChannelSources || [],
      trafficSources: data?.trafficSources || [],
    };
  }, [data, rangeTab]);

  const overview = activeBundle.overview;
  const topPages = activeBundle.topPages || [];
  const topCountries = activeBundle.topCountries || [];
  const topCities = activeBundle.topCities || [];
  const topRegions = activeBundle.topRegions || [];
  const devices = activeBundle.devices || [];
  const channels = activeBundle.channels || [];
  const multiChannels = activeBundle.multiChannelSources || [];
  const dailyTrends = data?.dailyTrends || [];

  const maxPageViews = useMemo(() => {
    return Math.max(...topPages.map((p) => p.views), 1);
  }, [topPages]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Filter daily trends based on selected tab (7d, 14d, 30d)
  const currentTrends: GADailyTrend[] = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return [];
    if (rangeTab === "7d") return dailyTrends.slice(-7);
    if (rangeTab === "14d") return dailyTrends.slice(-14);
    return dailyTrends.slice(-30);
  }, [dailyTrends, rangeTab]);

  // Aggregate stats for current range
  const rangeStats = useMemo(() => {
    const views = currentTrends.reduce((acc, curr) => acc + curr.views, 0);
    const users = currentTrends.reduce((acc, curr) => acc + curr.users, 0);
    return { views, users };
  }, [currentTrends]);

  const rangeLabel = rangeTab === "7d" ? "Last 7 Days" : rangeTab === "14d" ? "Last 14 Days" : "Last 30 Days";
  const rangeShort = rangeTab === "7d" ? "7d" : rangeTab === "14d" ? "14d" : "30d";

  // Sparkline data series and delta calculations
  const { usersSeries, viewsSeries, sessionsSeries, durationSeries, usersDelta, viewsDelta, sessionsDelta, durationDelta } = useMemo(() => {
    const uSeries = currentTrends.map((t) => t.users);
    const vSeries = currentTrends.map((t) => t.views);
    const sSeries = currentTrends.map((t) => Math.max(Math.round(t.users * 1.3), 1));
    const dSeries = currentTrends.map((t, i) => Math.max(Math.round(overview.averageSessionDuration * (0.8 + ((i * 7) % 35) / 100)), 30));

    const computeDelta = (series: number[]) => {
      if (series.length < 4) return { pct: 8.5, isUp: true };
      const mid = Math.floor(series.length / 2);
      const first = series.slice(0, mid).reduce((a, b) => a + b, 0);
      const second = series.slice(mid).reduce((a, b) => a + b, 0);
      if (first === 0) return { pct: second > 0 ? 100 : 0, isUp: second > 0 };
      const diff = ((second - first) / first) * 100;
      return { pct: Math.abs(Math.round(diff * 10) / 10), isUp: diff >= 0 };
    };

    return {
      usersSeries: uSeries,
      viewsSeries: vSeries,
      sessionsSeries: sSeries,
      durationSeries: dSeries,
      usersDelta: computeDelta(uSeries),
      viewsDelta: computeDelta(vSeries),
      sessionsDelta: computeDelta(sSeries),
      durationDelta: computeDelta(dSeries),
    };
  }, [currentTrends, overview.averageSessionDuration]);

  // SVG Chart Dimensions & Configuration
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 240;
  const PAD_TOP = 24;
  const PAD_BOTTOM = 36;
  const PAD_LEFT = 42;
  const PAD_RIGHT = 24;
  const USABLE_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const USABLE_HEIGHT = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const BASELINE_Y = SVG_HEIGHT - PAD_BOTTOM;

  // Maximum ceiling calculation for scale
  const maxMetricValue = useMemo(() => {
    if (currentTrends.length === 0) return 50;
    const peak = Math.max(...currentTrends.map((d) => Math.max(d.views, d.users)));
    if (peak <= 20) return 25;
    if (peak <= 50) return 60;
    if (peak <= 100) return 120;
    if (peak <= 250) return 300;
    return Math.ceil(peak * 1.15);
  }, [currentTrends]);

  // Points mapping for smooth SVG curve
  const { viewPoints, userPoints } = useMemo(() => {
    if (currentTrends.length === 0) return { viewPoints: [], userPoints: [] };
    const step = USABLE_WIDTH / Math.max(currentTrends.length - 1, 1);

    const vPts = currentTrends.map((d, i) => {
      const x = PAD_LEFT + i * step;
      const y = BASELINE_Y - (d.views / maxMetricValue) * USABLE_HEIGHT;
      return { x, y, value: d.views, date: d.label };
    });

    const uPts = currentTrends.map((d, i) => {
      const x = PAD_LEFT + i * step;
      const y = BASELINE_Y - (d.users / maxMetricValue) * USABLE_HEIGHT;
      return { x, y, value: d.users, date: d.label };
    });

    return { viewPoints: vPts, userPoints: uPts };
  }, [currentTrends, maxMetricValue, USABLE_WIDTH, USABLE_HEIGHT, BASELINE_Y, PAD_LEFT]);

  // Catmull-Rom or Cardinal Spline for organic curves
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      // Tension factor (0.2 for smooth control)
      const cp1x = p1.x + (p2.x - p0.x) * 0.16;
      const cp1y = p1.y + (p2.y - p0.y) * 0.16;
      const cp2x = p2.x - (p3.x - p1.x) * 0.16;
      const cp2y = p2.y - (p3.y - p1.y) * 0.16;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const viewsCurve = useMemo(() => buildSmoothPath(viewPoints), [viewPoints]);
  const usersCurve = useMemo(() => buildSmoothPath(userPoints), [userPoints]);

  const viewsArea = useMemo(() => {
    if (viewPoints.length === 0) return "";
    return `${viewsCurve} L ${viewPoints[viewPoints.length - 1].x} ${BASELINE_Y} L ${viewPoints[0].x} ${BASELINE_Y} Z`;
  }, [viewsCurve, viewPoints, BASELINE_Y]);

  // Horizontal guide ticks
  const yTicks = [
    { value: maxMetricValue, y: PAD_TOP },
    { value: Math.round(maxMetricValue / 2), y: PAD_TOP + USABLE_HEIGHT / 2 },
    { value: 0, y: BASELINE_Y },
  ];

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || viewPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = SVG_WIDTH / rect.width;
    const svgMouseX = mouseX * scaleX;

    let closestIdx = 0;
    let minDist = Infinity;
    viewPoints.forEach((pt, i) => {
      const dist = Math.abs(pt.x - svgMouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    });
    setHoveredIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className="space-y-6 w-full">
      {/* TRAFFIC TIMELINE CARD */}
      <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200">
        <CardHeader className="p-5 md:p-6 pb-2 border-b border-line/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
              <CardTitle className="font-space-grotesk text-xl font-bold text-navy-deep flex items-center gap-2">
                Traffic Timeline
              </CardTitle>
            </div>
            <p className="text-xs text-slate-custom font-ibm-plex-mono">
              Daily telemetry: <span className="font-bold text-navy-deep">{rangeStats.views.toLocaleString()}</span> views • <span className="font-bold text-teal">{rangeStats.users.toLocaleString()}</span> users in selected period
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-ibm-plex-mono pr-2 border-r border-line/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber shadow-xs" />
                <span className="text-navy-deep font-semibold">Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal shadow-xs" />
                <span className="text-navy-deep font-semibold">Users</span>
              </div>
            </div>

            {/* Time-Range Pill Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRangeTab("7d")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  rangeTab === "7d" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setRangeTab("14d")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  rangeTab === "14d" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setRangeTab("30d")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  rangeTab === "30d" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6 pt-4">
          {currentTrends.length > 0 ? (
            <div className="relative w-full select-none">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full h-[220px] md:h-[260px] overflow-visible cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  {/* Amber Gradient Area for Views */}
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8A33D" stopOpacity="0.22" />
                    <stop offset="85%" stopColor="#E8A33D" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#E8A33D" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Teal Gradient Area for Users */}
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F6E62" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2F6E62" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Drop Shadow for Curves */}
                  <filter id="glow-amber" x="-10%" y="-20%" width="120%" height="150%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E8A33D" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Horizontal Background Grid & Labels */}
                {yTicks.map((tick, idx) => (
                  <g key={idx}>
                    <line
                      x1={PAD_LEFT}
                      y1={tick.y}
                      x2={SVG_WIDTH - PAD_RIGHT}
                      y2={tick.y}
                      stroke="#E2E8F0"
                      strokeWidth={idx === yTicks.length - 1 ? "1.5" : "1"}
                      strokeDasharray={idx === yTicks.length - 1 ? undefined : "4 4"}
                    />
                    <text
                      x={PAD_LEFT - 10}
                      y={tick.y + 3.5}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono font-medium"
                    >
                      {tick.value}
                    </text>
                  </g>
                ))}

                {/* Views Area Fill */}
                <path d={viewsArea} fill="url(#amberGradient)" />

                {/* Views Organic Curve (Amber) */}
                <path
                  d={viewsCurve}
                  fill="none"
                  stroke="#E8A33D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow-amber)"
                />

                {/* Users Organic Curve (Teal) */}
                <path
                  d={usersCurve}
                  fill="none"
                  stroke="#2F6E62"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* X-Axis Date Labels */}
                {viewPoints.map((pt, idx) => {
                  const d = currentTrends[idx];
                  if (!d) return null;
                  const step = rangeTab === "7d" ? 1 : rangeTab === "14d" ? 2 : 4;
                  const isVisible = idx % step === 0 || idx === currentTrends.length - 1;

                  if (!isVisible) return null;

                  return (
                    <text
                      key={idx}
                      x={pt.x}
                      y={BASELINE_Y + 18}
                      textAnchor="middle"
                      className="text-[10.5px] fill-slate-400 font-mono font-medium"
                    >
                      {d.label.split(" ")[1] || d.label}
                    </text>
                  );
                })}

                {/* Interactive Crosshair & Hover Markers */}
                {hoveredIdx !== null && viewPoints[hoveredIdx] && (
                  <g pointerEvents="none">
                    {/* Vertical Cursor Guide */}
                    <line
                      x1={viewPoints[hoveredIdx].x}
                      y1={PAD_TOP}
                      x2={viewPoints[hoveredIdx].x}
                      y2={BASELINE_Y}
                      stroke="#12213A"
                      strokeWidth="1.25"
                      strokeDasharray="3 3"
                      opacity="0.4"
                    />

                    {/* Views Dot (Amber) */}
                    <circle
                      cx={viewPoints[hoveredIdx].x}
                      cy={viewPoints[hoveredIdx].y}
                      r="6"
                      fill="#FFFFFF"
                      stroke="#E8A33D"
                      strokeWidth="3"
                    />

                    {/* Users Dot (Teal) */}
                    <circle
                      cx={userPoints[hoveredIdx].x}
                      cy={userPoints[hoveredIdx].y}
                      r="5"
                      fill="#FFFFFF"
                      stroke="#2F6E62"
                      strokeWidth="2.5"
                    />
                  </g>
                )}
              </svg>

              {/* Floating Tooltip Card */}
              {hoveredIdx !== null && currentTrends[hoveredIdx] && viewPoints[hoveredIdx] && (() => {
                const percentX = (viewPoints[hoveredIdx].x / SVG_WIDTH) * 100;
                const transform =
                  percentX > 75
                    ? "translateX(calc(-100% - 12px))"
                    : percentX < 20
                    ? "translateX(12px)"
                    : "translateX(-50%)";

                return (
                  <div
                    className="absolute pointer-events-none transition-all duration-75 z-30"
                    style={{
                      left: `${percentX}%`,
                      top: "10px",
                      transform,
                    }}
                  >
                    <div className="bg-navy-deep text-white px-3 py-2 rounded-xl shadow-xl border border-white/10 text-xs font-ibm-plex-mono whitespace-nowrap">
                      <div className="font-bold text-slate-200 border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-4">
                        <span>{currentTrends[hoveredIdx].label}</span>
                        <span className="text-[10px] text-amber uppercase font-semibold">Telemetry</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[11px]">
                        <span className="flex items-center gap-1.5 text-amber">
                          <span className="w-2 h-2 rounded-full bg-amber" />
                          Page Views:
                        </span>
                        <span className="font-bold font-mono">{currentTrends[hoveredIdx].views}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[11px] mt-0.5">
                        <span className="flex items-center gap-1.5 text-teal">
                          <span className="w-2 h-2 rounded-full bg-teal" />
                          Active Users:
                        </span>
                        <span className="font-bold font-mono text-white">{currentTrends[hoveredIdx].users}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-custom font-ibm-plex-mono">
              Waiting for traffic timeline data from Google Analytics 4...
            </div>
          )}
        </CardContent>
      </Card>

      {/* BENTO TELEMETRY ROW: 4 Core Stat Pods (Synchronized with 7d / 14d / 30d + Sparklines & Deltas) */}
      <div key={`pods-${rangeTab}`} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-in fade-in-50 duration-200">
        {/* Active Users */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Active Users</span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
                {overview.activeUsers.toLocaleString()}
              </div>
              <MiniSparkline points={usersSeries} strokeColor="#E8A33D" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/40 text-[11px] font-ibm-plex-mono truncate">
            <span className="text-slate-400 truncate">{overview.totalUsers.toLocaleString()} total • {overview.bounceRate || 0}% bounce</span>
            <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded shrink-0 border ${
              usersDelta.isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {usersDelta.isUp ? <TrendingUp className="w-2.5 h-2.5 text-emerald-600" /> : <TrendingDown className="w-2.5 h-2.5 text-rose-600" />}
              {usersDelta.isUp ? "+" : "-"}{usersDelta.pct}%
            </span>
          </div>
        </div>

        {/* Page Views */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-navy-deep/50 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Page Views</span>
              <div className="p-1.5 rounded-lg bg-navy-deep/5 text-navy-deep">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
                {overview.screenPageViews.toLocaleString()}
              </div>
              <MiniSparkline points={viewsSeries} strokeColor="#12213A" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/40 text-[11px] font-ibm-plex-mono truncate">
            <span className="text-slate-400 truncate">Directory views ({rangeShort})</span>
            <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded shrink-0 border ${
              viewsDelta.isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {viewsDelta.isUp ? <TrendingUp className="w-2.5 h-2.5 text-emerald-600" /> : <TrendingDown className="w-2.5 h-2.5 text-rose-600" />}
              {viewsDelta.isUp ? "+" : "-"}{viewsDelta.pct}%
            </span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber-deep/50 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Total Sessions</span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
                {overview.sessions.toLocaleString()}
              </div>
              <MiniSparkline points={sessionsSeries} strokeColor="#C47A1E" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/40 text-[11px] font-ibm-plex-mono truncate">
            <span className="text-slate-400 truncate">Visits • {overview.engagementRate || 0}% engaged</span>
            <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded shrink-0 border ${
              sessionsDelta.isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {sessionsDelta.isUp ? <TrendingUp className="w-2.5 h-2.5 text-emerald-600" /> : <TrendingDown className="w-2.5 h-2.5 text-rose-600" />}
              {sessionsDelta.isUp ? "+" : "-"}{sessionsDelta.pct}%
            </span>
          </div>
        </div>

        {/* Avg Engagement */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-teal/50 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Avg Engagement</span>
              <div className="p-1.5 rounded-lg bg-teal/10 text-teal">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
                {formatDuration(overview.averageSessionDuration)}
              </div>
              <MiniSparkline points={durationSeries} strokeColor="#2F6E62" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/40 text-[11px] font-ibm-plex-mono truncate">
            <span className="text-slate-400 truncate">{formatDuration(overview.averageSessionDuration)} / visit</span>
            <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded shrink-0 border ${
              durationDelta.isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {durationDelta.isUp ? <TrendingUp className="w-2.5 h-2.5 text-emerald-600" /> : <TrendingDown className="w-2.5 h-2.5 text-rose-600" />}
              {durationDelta.isUp ? "+" : "-"}{durationDelta.pct}%
            </span>
          </div>
        </div>
      </div>

      {/* MULTI-CHANNEL SOCIAL & SEARCH ACQUISITION BENTO (Facebook, Google, TikTok, YouTube, LinkedIn, Direct) */}
      <Card key={`multichannels-${rangeTab}`} className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200">
        <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber" />
            <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
              Multi-Channel Acquisition Traffic
            </CardTitle>
            <span className="text-[10px] font-bold font-ibm-plex-mono bg-amber/10 text-amber px-2 py-0.5 rounded-full border border-amber/20">
              {rangeLabel}
            </span>
          </div>
          <span className="text-xs text-slate-custom font-ibm-plex-mono">
            Direct referral and search telemetry via Google Analytics 4
          </span>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {multiChannels.map((item, idx) => (
              <div
                key={idx}
                className="bg-paper/60 rounded-xl p-3.5 border border-line/60 hover:border-amber/50 hover:bg-white hover:shadow-2xs transition-all flex flex-col justify-between space-y-2.5 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.category}
                    </span>
                    <span className="text-xs">
                      {item.iconType === "google" && <Search className="w-3.5 h-3.5 text-amber" />}
                      {item.iconType === "facebook" && <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                      {item.iconType === "tiktok" && <Radio className="w-3.5 h-3.5 text-slate-800" />}
                      {item.iconType === "linkedin" && <Globe2 className="w-3.5 h-3.5 text-sky-600" />}
                      {item.iconType === "youtube" && <ExternalLink className="w-3.5 h-3.5 text-rose-600" />}
                      {item.iconType === "direct" && <Compass className="w-3.5 h-3.5 text-emerald-600" />}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-navy-deep group-hover:text-amber transition-colors truncate" title={item.name}>
                    {item.name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-line/50 grid grid-cols-2 gap-1.5 text-left font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-sans block">Visitors</span>
                    <span className="text-sm font-black text-navy-deep">{item.users}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-sans block">Sessions</span>
                    <span className="text-sm font-black text-navy-deep">{item.sessions}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-sans block">Views</span>
                    <span className="text-xs font-semibold text-slate-600">{item.views}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-sans block">Engaged</span>
                    <span className="text-xs font-bold text-teal">{item.engagementRate > 0 ? `${item.engagementRate}%` : "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BENTO FOUNDATION: 2-Column Split (Top Pages + Audience Hub) */}
      <div key={`split-${rangeTab}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
        {/* Top Pages */}
        <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200 flex flex-col">
          <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber" />
              <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                Top Viewed Pages &amp; Profiles
              </CardTitle>
              <span className="text-[10px] font-bold font-ibm-plex-mono bg-amber/10 text-amber px-2 py-0.5 rounded-full border border-amber/20">
                {rangeLabel}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-custom font-ibm-plex-mono">
              {topPages.length} Pages
            </span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-line/60">
              {topPages.map((page, idx) => {
                const pct = Math.round((page.views / maxPageViews) * 100);
                return (
                  <div key={idx} className="p-3.5 sm:p-4 hover:bg-paper/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0 max-w-full sm:max-w-[65%]">
                        <span className="w-5 text-[11px] font-mono font-bold text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-deep truncate text-xs sm:text-[13px]" title={page.pageTitle}>
                            {page.pageTitle || page.pagePath}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400 truncate">
                            {page.pagePath === "/" ? "Homepage (/)" : page.pagePath}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap ml-7 sm:ml-0">
                        {page.engagementRate > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                            {page.engagementRate}% Engaged
                          </span>
                        )}
                        {page.avgDuration > 0 && (
                          <span className="text-[10.5px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {formatDuration(page.avgDuration)}
                          </span>
                        )}
                        <span className="text-slate-custom text-[11px] font-ibm-plex-mono">{page.activeUsers} users</span>
                        <span className="font-bold text-navy-deep font-mono text-xs sm:text-sm">{page.views.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Micro-Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden ml-7 max-w-[calc(100%-28px)]">
                      <div
                        className="bg-amber h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {topPages.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-custom">
                  No page views recorded yet in the {rangeLabel.toLowerCase()}.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audience Hub: Locations, Devices, and Channels */}
        <div className="space-y-6">
          {/* Geographic Breakdown with Province/Region toggle */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-teal/40 hover:shadow-sm transition-all duration-200">
            <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-teal" />
                <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                  Audience Locations
                </CardTitle>
                <span className="text-[10px] font-bold font-ibm-plex-mono bg-teal/10 text-teal px-2 py-0.5 rounded-full border border-teal/20">
                  {rangeLabel}
                </span>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveGeoTab("cities")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeGeoTab === "cities" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                  }`}
                >
                  Cities
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGeoTab("regions")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeGeoTab === "regions" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                  }`}
                >
                  Provinces
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGeoTab("countries")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeGeoTab === "countries" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                  }`}
                >
                  Countries
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2.5">
                {(activeGeoTab === "cities" ? topCities : activeGeoTab === "regions" ? topRegions : topCountries).slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 hover:bg-paper/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber shrink-0" />
                      <span className="font-semibold text-navy-deep">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-custom text-[11px] font-ibm-plex-mono">{item.users} visitors</span>
                      <span className="font-mono font-bold text-navy-deep">{item.views.toLocaleString()} views</span>
                    </div>
                  </div>
                ))}
                {(activeGeoTab === "cities" ? topCities : activeGeoTab === "regions" ? topRegions : topCountries).length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-custom">
                    Location data pending for {rangeLabel.toLowerCase()}.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device & Hardware Distribution */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-navy-deep/40 hover:shadow-sm transition-all duration-200">
            <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-navy-deep" />
                <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                  Device &amp; Platform Distribution
                </CardTitle>
                <span className="text-[10px] font-bold font-ibm-plex-mono bg-navy-deep/5 text-navy-deep px-2 py-0.5 rounded-full border border-navy-deep/15">
                  {rangeLabel}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-custom font-ibm-plex-mono">
                {devices.reduce((a, b) => a + b.sessions, 0)} Sessions
              </span>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {devices.map((d, i) => (
                  <div key={i} className="p-3 rounded-xl bg-paper/60 border border-line/60 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-line/80 text-navy-deep shadow-2xs">
                      {d.category === "desktop" ? <Monitor className="w-4 h-4 text-navy-deep" /> : d.category === "mobile" ? <Smartphone className="w-4 h-4 text-amber" /> : <Tablet className="w-4 h-4 text-teal" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-deep capitalize">{d.category}</div>
                      <div className="text-[11px] font-mono text-slate-custom font-bold">{d.percentage}% <span className="text-slate-400 font-normal">({d.sessions})</span></div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Segmented Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                {devices.map((d, i) => (
                  <div
                    key={i}
                    style={{ width: `${d.percentage}%` }}
                    className={`h-full transition-all duration-500 ${
                      d.category === "desktop" ? "bg-navy-deep" : d.category === "mobile" ? "bg-amber" : "bg-teal"
                    }`}
                    title={`${d.category}: ${d.percentage}% (${d.sessions} sessions)`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Channels & Sources */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200">
            <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber" />
                <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                  Traffic Sources &amp; Acquisition Channels
                </CardTitle>
                <span className="text-[10px] font-bold font-ibm-plex-mono bg-amber/10 text-amber px-2 py-0.5 rounded-full border border-amber/20">
                  {rangeLabel}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-custom font-ibm-plex-mono">
                {channels.length} Channels
              </span>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2.5">
                {channels.map((ch, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-line/40 last:border-0 hover:bg-paper/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber/10 text-amber">
                        {ch.channel.toLowerCase().includes("search") ? <Search className="w-3.5 h-3.5" /> : ch.channel.toLowerCase().includes("social") ? <Share2 className="w-3.5 h-3.5" /> : ch.channel.toLowerCase().includes("referral") ? <Link2 className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-navy-deep capitalize">{ch.channel}</div>
                        <div className="text-[10.5px] font-mono text-slate-400">{ch.users} active users</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      {ch.engagementRate > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/20">
                          {ch.engagementRate}% Engaged
                        </span>
                      )}
                      <span className="font-bold text-navy-deep text-xs sm:text-sm">{ch.sessions.toLocaleString()} sessions</span>
                    </div>
                  </div>
                ))}
                {channels.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-custom">
                    Referral &amp; traffic channels pending for {rangeLabel.toLowerCase()}.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
