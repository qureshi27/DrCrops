"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Diagnosis } from "./diagnosis-schema";

export type Scan = {
  id: string;
  createdAt: number;
  cropHint?: string;
  thumbnail: string; // base64 small preview
  diagnosis: Diagnosis;
  lang: string;
};

type State = {
  scans: Scan[];
  addScan: (s: Scan) => void;
  removeScan: (id: string) => void;
  getScan: (id: string) => Scan | undefined;
  clear: () => void;
};

export const useScans = create<State>()(
  persist(
    (set, get) => ({
      scans: [],
      addScan: (s) => set({ scans: [s, ...get().scans].slice(0, 100) }),
      removeScan: (id) => set({ scans: get().scans.filter((s) => s.id !== id) }),
      getScan: (id) => get().scans.find((s) => s.id === id),
      clear: () => set({ scans: [] })
    }),
    { name: "yld.scans" }
  )
);
