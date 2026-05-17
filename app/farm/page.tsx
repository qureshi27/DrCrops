"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite } from "lucide-react";
import { FarmMap } from "@/components/farm/farm-map";
import { NDVIDashboard } from "@/components/farm/ndvi-dashboard";
import { Badge } from "@/components/ui/badge";

type LngLat = [number, number];

export default function FarmPage() {
  const [polygon, setPolygon] = useState<LngLat[] | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Badge variant="field">
          <Satellite className="size-3" />
          Sentinel-2 · 10m resolution · 5-day refresh
        </Badge>
        <h1 className="mt-4 text-4xl font-bold text-gradient">
          Satellite intelligence for your field
        </h1>
        <p className="mt-3 text-ink-muted max-w-2xl">
          Draw the outline of your plot below. We fetch the latest NDVI vegetation-health
          imagery from the European Space Agency's Sentinel-2 mission and chart it over
          time so you can spot stress before the eye can.
        </p>
      </motion.div>

      {!apiKey && (
        <div className="card border border-yellow-400/30 bg-yellow-400/5 p-4 text-sm text-yellow-200 mb-6">
          <p className="font-medium">Map disabled</p>
          <p className="mt-1 text-ink-muted">
            Set <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> (or{" "}
            <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>) in
            your <code className="font-mono">.env</code> and restart the dev server.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {apiKey && <FarmMap apiKey={apiKey} onPolygon={setPolygon} />}
        <NDVIDashboard polygon={polygon} />
      </div>
    </div>
  );
}
