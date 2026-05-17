"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, History as HistoryIcon, Camera } from "lucide-react";
import { useScans, type Scan } from "@/lib/scan-store";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const scans = useScans((s) => s.scans);
  const removeScan = useScans((s) => s.removeScan);
  const clear = useScans((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">
            History
            <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
              · ریکارڈ
            </span>
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gradient">Past scans</h1>
          <p dir="rtl" lang="ur" className="mt-2 text-xl text-ink-muted">
            پچھلی تشخیصیں
          </p>
          <p className="mt-2 text-ink-muted">
            Stored on this device only — never uploaded to a server.
          </p>
          <p
            dir="rtl"
            lang="ur"
            className="mt-1 text-sm text-ink-dim leading-loose"
          >
            صرف اسی ڈیوائس پر محفوظ — کسی سرور پر نہیں جاتا۔
          </p>
        </div>
        {mounted && scans.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all scans? This cannot be undone.")) clear();
            }}
            className="rounded-pill px-4 py-2 text-sm border border-red-400/30 text-red-300 hover:bg-red-400/10 transition inline-flex items-center gap-1.5"
          >
            <Trash2 className="size-4" />
            Clear all
          </button>
        )}
      </div>

      {!mounted ? null : scans.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scans.map((s) => (
            <ScanCard key={s.id} scan={s} onRemove={() => removeScan(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScanCard({ scan, onRemove }: { scan: Scan; onRemove: () => void }) {
  const sevColor =
    scan.diagnosis.severity === "severe"
      ? "text-red-400"
      : scan.diagnosis.severity === "moderate"
      ? "text-orange-400"
      : scan.diagnosis.severity === "mild"
      ? "text-yellow-300"
      : "text-emerald-400";

  const date = new Date(scan.createdAt).toLocaleString();
  return (
    <div className="card overflow-hidden group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scan.thumbnail}
        alt={scan.diagnosis.disease}
        className="w-full h-44 object-cover"
      />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{scan.diagnosis.disease}</h3>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition text-ink-dim hover:text-red-400"
            title="Remove"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge>{scan.diagnosis.confidence.toFixed(0)}%</Badge>
          <span className={`text-xs font-medium ${sevColor}`}>
            {scan.diagnosis.severity}
          </span>
        </div>
        <p className="text-[11px] text-ink-dim">{date}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card-elevated p-12 text-center">
      <HistoryIcon className="size-10 mx-auto text-ink-dim" />
      <h3 className="mt-4 text-xl font-semibold">No scans yet</h3>
      <p className="mt-2 text-ink-muted max-w-sm mx-auto">
        Run your first diagnosis to see it here.
      </p>
      <Link
        href="/diagnose"
        className="mt-6 inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm bg-gradient-to-r from-accent to-accent-glow text-black font-semibold shadow-glow-cyan hover:brightness-110 transition"
      >
        <Camera className="size-4" />
        Diagnose a plant
      </Link>
    </div>
  );
}
