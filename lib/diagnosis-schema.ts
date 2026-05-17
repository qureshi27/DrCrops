import { z } from "zod";

export const TreatmentSchema = z.object({
  name: z.string(),
  active_ingredient: z.string().optional(),
  dose: z.string().optional(),
  timing: z.string().optional(),
  notes: z.string().optional()
});

export const DiagnosisSchema = z.object({
  is_plant: z.boolean().default(true),
  crop: z.string().nullable().optional(),
  disease: z.string(),
  scientific_name: z.string().optional().nullable(),
  confidence: z.number().min(0).max(100),
  severity: z.enum(["none", "mild", "moderate", "severe"]),
  affected_parts: z.array(z.string()).default([]),
  symptoms: z.array(z.string()).default([]),
  causes: z.array(z.string()).default([]),
  spread_risk: z.enum(["low", "moderate", "high"]).default("moderate"),
  treatments: z.object({
    organic: z.array(TreatmentSchema).default([]),
    biological: z.array(TreatmentSchema).default([]),
    chemical: z.array(TreatmentSchema).default([])
  }),
  prevention: z.array(z.string()).default([]),
  urgency: z.enum(["routine", "this_week", "immediate"]).default("this_week"),
  follow_up: z.string().optional()
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;
