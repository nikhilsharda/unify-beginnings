"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MapPoint } from "@prisma/client";

export function WorldMap({ points }: { points: MapPoint[] }) {
  const [active, setActive] = useState<MapPoint | null>(points[0] ?? null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden brand-shape-lg border border-gray-300"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #0a3d67 0%, #062744 55%, #041a30 100%)",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              x2={100}
              y1={i * 10}
              y2={i * 10}
              stroke="white"
              strokeWidth={0.15}
            />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`v${i}`}
              y1={0}
              y2={100}
              x1={i * 10}
              x2={i * 10}
              stroke="white"
              strokeWidth={0.15}
            />
          ))}
        </svg>

        {points.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {active?.id === p.id && (
              <motion.span
                layoutId="map-pulse"
                className="absolute inset-0 -m-2 rounded-full"
                style={{ background: "var(--brand-yellow)", opacity: 0.35 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              />
            )}
            <span
              className={`relative block h-3.5 w-3.5 rounded-full border-2 border-white transition-transform group-hover:scale-125 ${
                active?.id === p.id ? "scale-125" : ""
              }`}
              style={{
                background: active?.id === p.id ? "var(--brand-yellow)" : "var(--brand-red)",
                boxShadow: "0 0 0 4px rgba(255,255,255,0.15)",
              }}
            />
            <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {p.country}
            </span>
          </button>
        ))}
      </div>

      <div className="brand-shape border border-gray-300 bg-white p-6">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                Footprint
              </p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">{active.country}</h3>
              <p className="mt-3 text-sm text-gray-600">{active.blurb}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="brand-shape-sm bg-gray-100 p-3">
                  <dt className="text-[11px] uppercase text-gray-500">Partners</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-brand-red">
                    {active.partners}+
                  </dd>
                </div>
                <div className="brand-shape-sm bg-gray-100 p-3">
                  <dt className="text-[11px] uppercase text-gray-500">Channel Partners</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-brand-red">
                    {active.channelPartners}+
                  </dd>
                </div>
                <div className="brand-shape-sm bg-gray-100 p-3">
                  <dt className="text-[11px] uppercase text-gray-500">Lives Impacted</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-brand-red">
                    {active.livesImpacted >= 1000
                      ? `${Math.round(active.livesImpacted / 1000)}K+`
                      : `${active.livesImpacted}+`}
                  </dd>
                </div>
              </dl>
            </motion.div>
          ) : (
            <p className="text-sm text-gray-500">Click a point on the map to explore.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
