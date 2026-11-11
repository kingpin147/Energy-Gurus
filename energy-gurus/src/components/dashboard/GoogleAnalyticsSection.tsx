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
  Layers,
  Share2
} from "lucide-react";
import { GAResponse, GADailyTrend } from "@/lib/google-analytics";

interface Props {
  data: GAResponse;
}

export function GoogleAnalyticsSection({ data }: Props) {
  const [activeGeoTab, setActiveGeoTab] = useState<"cities" | "countries">("cities");
  const [rangeTab, setRangeTab] = useState<"7d" | "14d" | "30d">("30d"); // Default is 30 days
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const overview = data?.overview || {
    activeUsers: 0,
    totalUsers: 0,
    screenPageViews: 0,
    sessions: 0,
    averageSessionDuration: 0,
  };

  const topPages = data?.topPages || [];
  const topCountries = data?.topCountries || [];
  const topCities = data?.topCities || [];
  const trafficSources = data?.trafficSources || [];
  const dailyTrends = data?.dailyTrends || [];

  const maxPageViews = Math.max(...topPages.map((p) => p.views), 1);

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

  // SVG Chart Geometry Constants
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 230;
  const PAD_LEFT = 45;
  const PAD_RIGHT = 30;
  const PAD_TOP = 25;
  const PAD_BOTTOM = 35;
  const CHART_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const CHART_HEIGHT = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const BASELINE_Y = PAD_TOP + CHART_HEIGHT;

  const rawMax = Math.max(
    ...currentTrends.map((d) => Math.max(d.views, d.users)),
    10
  );
  // Add 15% headroom for aesthetic spacing
  const chartMax = Math.ceil(rawMax * 1.15);

  // Compute point coordinates
  const { viewPoints, userPoints } = useMemo(() => {
    const count = currentTrends.length;
    if (count === 0) return { viewPoints: [], userPoints: [] };

    const vp: { x: number; y: number }[] = [];
    const up: { x: number; y: number }[] = [];

    currentTrends.forEach((d, i) => {
      const x = count === 1 ? PAD_LEFT + CHART_WIDTH / 2 : PAD_LEFT + (i / (count - 1)) * CHART_WIDTH;
      const vy = BASELINE_Y - (d.views / chartMax) * CHART_HEIGHT;
      const uy = BASELINE_Y - (d.users / chartMax) * CHART_HEIGHT;
      vp.push({ x, y: vy });
      up.push({ x, y: uy });
    });

    return { viewPoints: vp, userPoints: up };
  }, [currentTrends, chartMax, CHART_WIDTH, CHART_HEIGHT, BASELINE_Y]);

  // Cubic Bezier spline generator
  const getSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const viewsPath = useMemo(() => getSplinePath(viewPoints), [viewPoints]);
  const usersPath = useMemo(() => getSplinePath(userPoints), [userPoints]);

  const viewsAreaPath = useMemo(() => {
    if (viewPoints.length === 0) return "";
    const first = viewPoints[0];
    const last = viewPoints[viewPoints.length - 1];
    return `${viewsPath} L ${last.x.toFixed(1)} ${BASELINE_Y} L ${first.x.toFixed(1)} ${BASELINE_Y} Z`;
  }, [viewsPath, viewPoints, BASELINE_Y]);

  const usersAreaPath = useMemo(() => {
    if (userPoints.length === 0) return "";
    const first = userPoints[0];
    const last = userPoints[userPoints.length - 1];
    return `${usersPath} L ${last.x.toFixed(1)} ${BASELINE_Y} L ${first.x.toFixed(1)} ${BASELINE_Y} Z`;
  }, [usersPath, userPoints, BASELINE_Y]);

  // Pointer move handler for interactive tracking
  const svgRef = useRef<SVGSVGElement | null>(null);
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || currentTrends.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = SVG_WIDTH / rect.width;
    const svgX = clientX * scaleX;

    const count = currentTrends.length;
    const step = CHART_WIDTH / Math.max(count - 1, 1);
    const rawIdx = Math.round((svgX - PAD_LEFT) / step);
    const clamped = Math.max(0, Math.min(count - 1, rawIdx));
    setHoveredIdx(clamped);
  };

  const handlePointerLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className="space-y-6">
      {/* BENTO HERO BAY: Interactive Line Chart */}
      <Card className="border border-line/80 shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200">
        <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber" />
              <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                Traffic Timeline
              </CardTitle>
            </div>
            <p className="text-xs text-slate-custom mt-0.5 font-ibm-plex-mono">
              Daily telemetry:{" "}
              <strong className="text-navy-deep">{rangeStats.views.toLocaleString()}</strong> views ·{" "}
              <strong className="text-navy-deep">{rangeStats.users.toLocaleString()}</strong> users in selected period
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-ibm-plex-mono">
              <span className="flex items-center gap-1.5 font-semibold text-navy-deep">
                <span className="w-2.5 h-2.5 rounded-full bg-amber" /> Views
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-teal">
                <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Users
              </span>
            </div>

            {/* 3 Tabs: 7 Days / 14 Days / 30 Days (Default 30 Days) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-ibm-plex-mono border border-line/50">
              {(["7d", "14d", "30d"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setRangeTab(tab);
                    setHoveredIdx(null);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    rangeTab === tab
                      ? "bg-white text-navy-deep shadow-xs border border-line/60"
                      : "text-slate-500 hover:text-navy-deep"
                  }`}
                >
                  {tab === "7d" ? "7 Days" : tab === "14d" ? "14 Days" : "30 Days"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-4">
          {currentTrends.length > 0 ? (
            <div className="relative w-full">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full h-auto select-none cursor-crosshair touch-none"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              >
                <defs>
                  {/* Views Gradient (Amber) */}
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8A33D" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#E8A33D" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Users Gradient (Teal) */}
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F6E62" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2F6E62" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines with Y-Axis Values */}
                {[0, 0.33, 0.66, 1].map((pct, i) => {
                  const y = BASELINE_Y - pct * CHART_HEIGHT;
                  const val = Math.round(pct * chartMax);
                  return (
                    <g key={i}>
                      <line
                        x1={PAD_LEFT}
                        y1={y}
                        x2={PAD_LEFT + CHART_WIDTH}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={PAD_LEFT - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Area Fills */}
                <path d={viewsAreaPath} fill="url(#viewsGradient)" />
                <path d={usersAreaPath} fill="url(#usersGradient)" />

                {/* Line Curves */}
                <path
                  d={viewsPath}
                  fill="none"
                  stroke="#E8A33D"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={usersPath}
                  fill="none"
                  stroke="#2F6E62"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* X-Axis Baseline */}
                <line
                  x1={PAD_LEFT}
                  y1={BASELINE_Y}
                  x2={PAD_LEFT + CHART_WIDTH}
                  y2={BASELINE_Y}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />

                {/* X-Axis Date Labels */}
                {currentTrends.map((d, idx) => {
                  const pt = viewPoints[idx];
                  if (!pt) return null;

                  // Label frequency spacing based on range:
                  // 7d -> show all 7 labels
                  // 14d -> show every 2nd label + last
                  // 30d -> show every 4th label + last
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
              {hoveredIdx !== null && currentTrends[hoveredIdx] && viewPoints[hoveredIdx] && (
                <div
                  className="absolute pointer-events-none transition-transform duration-75 z-30"
                  style={{
                    left: `${(viewPoints[hoveredIdx].x / SVG_WIDTH) * 100}%`,
                    top: "10px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="bg-navy-deep text-white px-3 py-2 rounded-xl shadow-xl border border-white/10 text-xs font-ibm-plex-mono whitespace-nowrap">
                    <div className="font-bold text-slate-200 border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between gap-4">
                      <span>{currentTrends[hoveredIdx].label}</span>
                      <span className="text-[10px] text-slate-400">Telemetry</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-amber" /> Page Views:
                      </span>
                      <strong className="text-amber font-mono font-bold">
                        {currentTrends[hoveredIdx].views.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-teal" /> Active Users:
                      </span>
                      <strong className="text-teal font-mono font-bold">
                        {currentTrends[hoveredIdx].users.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-custom font-ibm-plex-mono">
              Waiting for traffic timeline data from Google Analytics 4...
            </div>
          )}
        </CardContent>
      </Card>

      {/* BENTO TELEMETRY ROW: 4 Core Stat Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Users */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Active Users</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {overview.activeUsers.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            {overview.totalUsers.toLocaleString()} Total visitors (30d)
          </p>
        </div>

        {/* Page Views */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-navy-deep/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Page Views</span>
            <div className="p-1.5 rounded-lg bg-navy-deep/5 text-navy-deep">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {overview.screenPageViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            Across directory &amp; profiles
          </p>
        </div>

        {/* Total Sessions */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber-deep/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Total Sessions</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {overview.sessions.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            User visits &amp; return visits
          </p>
        </div>

        {/* Avg Engagement */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-teal/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Avg Engagement</span>
            <div className="p-1.5 rounded-lg bg-teal/10 text-teal">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {formatDuration(overview.averageSessionDuration)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            Time spent per session
          </p>
        </div>
      </div>

      {/* BENTO FOUNDATION: 2-Column Split (Top Pages + Audience Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200">
          <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber" />
              <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                Top Viewed Pages &amp; Profiles
              </CardTitle>
            </div>
            <span className="text-xs font-semibold text-slate-custom font-ibm-plex-mono">
              {topPages.length} Pages
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-line/60">
              {topPages.map((page, idx) => {
                const pct = Math.round((page.views / maxPageViews) * 100);
                return (
                  <div key={idx} className="p-3.5 hover:bg-paper/40 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2 max-w-[70%]">
                        <span className="w-5 text-[11px] font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-navy-deep truncate" title={page.pageTitle}>
                          {page.pagePath === "/" ? "Homepage (/)" : page.pagePath}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-custom text-[11px] font-ibm-plex-mono">{page.activeUsers} users</span>
                        <span className="font-bold text-navy-deep font-mono">{page.views.toLocaleString()}</span>
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
                  No page views recorded yet in the last 30 days.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audience Locations & Channels */}
        <div className="space-y-6">
          {/* Geographic Breakdown */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-teal/40 hover:shadow-sm transition-all duration-200">
            <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-teal" />
                <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                  Audience Locations
                </CardTitle>
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
                {(activeGeoTab === "cities" ? topCities : topCountries).slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 hover:bg-paper/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber" />
                      <span className="font-semibold text-navy-deep">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-custom text-[11px] font-ibm-plex-mono">{item.users} visitors</span>
                      <span className="font-mono font-bold text-navy-deep">{item.views} views</span>
                    </div>
                  </div>
                ))}
                {(activeGeoTab === "cities" ? topCities : topCountries).length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-custom">
                    Location data will populate as visitors browse.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-sm transition-all duration-200">
            <CardHeader className="p-5 pb-3 border-b border-line/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber" />
                <CardTitle className="font-space-grotesk text-base font-bold text-navy-deep">
                  Traffic Sources &amp; Channels
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2.5">
                {trafficSources.slice(0, 5).map((src, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-line/40 last:border-0 hover:bg-paper/40 px-2 rounded-lg transition-colors">
                    <span className="font-semibold text-navy-deep capitalize">
                      {src.source === "(direct)" ? "Direct / Bookmarks" : src.source}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-custom text-[11px]">{src.sessions} sessions</span>
                      <span className="font-bold text-navy-deep">{src.users} users</span>
                    </div>
                  </div>
                ))}
                {trafficSources.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-custom">
                    Referral &amp; traffic channels pending.
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
