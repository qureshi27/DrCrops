"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Sprout } from "lucide-react";
import { CROPS } from "@/lib/crops";
import { formatPKR } from "@/lib/utils";

// Reference NPK needs (kg/acre, typical PK extension recommendations)
const NPK_TABLE: Record<string, { N: number; P: number; K: number }> = {
  wheat: { N: 55, P: 35, K: 25 },
  rice: { N: 50, P: 30, K: 25 },
  cotton: { N: 60, P: 30, K: 25 },
  sugarcane: { N: 100, P: 50, K: 50 },
  maize: { N: 80, P: 40, K: 30 },
  mango: { N: 40, P: 25, K: 30 },
  citrus: { N: 50, P: 25, K: 30 },
  tomato: { N: 70, P: 35, K: 50 },
  potato: { N: 75, P: 50, K: 60 },
  chili: { N: 60, P: 40, K: 40 }
};

// Bag math (50 kg bags, 2026 indicative PK prices in PKR)
const FERT = {
  urea: { N: 0.46, pricePerBag: 5300 }, // 46% N
  dap: { N: 0.18, P: 0.46, pricePerBag: 12500 }, // 18-46-0
  sop: { K: 0.5, pricePerBag: 14000 } // 0-0-50
};

export default function FertilizerCalculator() {
  const [cropId, setCropId] = useState("wheat");
  const [acres, setAcres] = useState(1);
  const [soilN, setSoilN] = useState(0);
  const [soilP, setSoilP] = useState(0);
  const [soilK, setSoilK] = useState(0);

  const result = useMemo(() => {
    const need = NPK_TABLE[cropId] ?? NPK_TABLE.wheat;
    const totalN = Math.max(0, (need.N - soilN) * acres);
    const totalP = Math.max(0, (need.P - soilP) * acres);
    const totalK = Math.max(0, (need.K - soilK) * acres);

    // Apply DAP first (covers P, also gives N)
    const dapKg = totalP / FERT.dap.P;
    const dapBags = dapKg / 50;
    const nFromDap = dapKg * FERT.dap.N;

    // Remaining N from urea
    const remN = Math.max(0, totalN - nFromDap);
    const ureaKg = remN / FERT.urea.N;
    const ureaBags = ureaKg / 50;

    // K from SOP
    const sopKg = totalK / FERT.sop.K;
    const sopBags = sopKg / 50;

    const cost =
      Math.ceil(ureaBags) * FERT.urea.pricePerBag +
      Math.ceil(dapBags) * FERT.dap.pricePerBag +
      Math.ceil(sopBags) * FERT.sop.pricePerBag;

    return {
      need,
      totals: { N: totalN, P: totalP, K: totalK },
      bags: {
        urea: ureaBags,
        dap: dapBags,
        sop: sopBags
      },
      cost
    };
  }, [cropId, acres, soilN, soilP, soilK]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">Calculator</p>
        <h1 className="mt-2 text-4xl font-bold text-gradient">Fertilizer planner</h1>
        <p className="mt-2 text-ink-muted max-w-2xl">
          Enter your crop, area and (optional) soil test values. We'll work out the
          50 kg bag math for Urea, DAP and SOP — and the cost in PKR.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 card p-6 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-dim">Crop</label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="mt-2 w-full bg-bg-elevated border border-line rounded-md p-3 text-sm"
            >
              {CROPS.map((c) => (
                <option key={c.id} value={c.id} className="bg-bg-base">
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-ink-dim">Area (acres)</label>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={acres}
              onChange={(e) => setAcres(Math.max(0.25, Number(e.target.value)))}
              className="mt-2 w-full bg-bg-elevated border border-line rounded-md p-3 text-sm font-mono"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-ink-dim mb-3">
              Soil test (kg/acre · optional)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "N", val: soilN, set: setSoilN },
                { label: "P", val: soilP, set: setSoilP },
                { label: "K", val: soilK, set: setSoilK }
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[11px] text-ink-dim">{f.label} in soil</label>
                  <input
                    type="number"
                    min={0}
                    value={f.val}
                    onChange={(e) => f.set(Math.max(0, Number(e.target.value)))}
                    className="mt-1 w-full bg-bg-elevated border border-line rounded-md p-2 text-sm font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="size-4 text-accent-glow" />
              <h3 className="font-semibold">Nutrient need ({acres} ac)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NutrientTile label="Nitrogen" value={result.totals.N} unit="kg" tint="emerald" />
              <NutrientTile label="Phosphorus" value={result.totals.P} unit="kg" tint="cyan" />
              <NutrientTile label="Potassium" value={result.totals.K} unit="kg" tint="field" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="size-4 text-field" />
              <h3 className="font-semibold">50 kg bags to buy</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <BagTile name="Urea" bags={result.bags.urea} price={FERT.urea.pricePerBag} />
              <BagTile name="DAP" bags={result.bags.dap} price={FERT.dap.pricePerBag} />
              <BagTile name="SOP" bags={result.bags.sop} price={FERT.sop.pricePerBag} />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-ink-dim">Estimated cost</span>
              <span className="text-2xl font-mono text-accent-glow">
                {formatPKR(result.cost)}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-ink-dim leading-relaxed">
              Prices are indicative 2026 averages and vary by district. Split N into
              2–3 applications (basal + tillering + booting for wheat; basal +
              transplant + panicle for rice).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NutrientTile({
  label,
  value,
  unit,
  tint
}: {
  label: string;
  value: number;
  unit: string;
  tint: "emerald" | "cyan" | "field";
}) {
  const color =
    tint === "emerald"
      ? "text-emerald-400"
      : tint === "cyan"
      ? "text-accent-glow"
      : "text-field";
  return (
    <div className="card-elevated p-4">
      <p className="text-[11px] text-ink-dim uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-2xl font-mono ${color}`}>{value.toFixed(1)}</p>
      <p className="text-[10px] text-ink-dim">{unit}</p>
    </div>
  );
}

function BagTile({ name, bags, price }: { name: string; bags: number; price: number }) {
  const whole = Math.ceil(bags);
  return (
    <div className="card-elevated p-4">
      <p className="text-[11px] text-ink-dim uppercase tracking-wider">{name}</p>
      <p className="mt-1 text-2xl font-mono text-ink">
        {whole}
        <span className="text-sm text-ink-dim ms-1">bags</span>
      </p>
      <p className="text-[10px] text-ink-dim mt-1">
        ≈ {bags.toFixed(2)} actual · {formatPKR(price)}/bag
      </p>
    </div>
  );
}
