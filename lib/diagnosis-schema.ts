import { z } from "zod";

export const TreatmentSchema = z.object({
  name: z.string(),
  active_ingredient: z.string().optional(),
  dose: z.string().optional(),
  timing: z.string().optional(),
  notes: z.string().optional()
});

const UrdurTranslationsSchema = z
  .object({
    disease: z.string().default(""),
    symptoms: z.array(z.string()).default([]),
    causes: z.array(z.string()).default([]),
    treatments: z
      .object({
        organic: z.array(TreatmentSchema).default([]),
        biological: z.array(TreatmentSchema).default([]),
        chemical: z.array(TreatmentSchema).default([])
      })
      .default({ organic: [], biological: [], chemical: [] }),
    prevention: z.array(z.string()).default([]),
    follow_up: z.string().default("")
  })
  .default({
    disease: "",
    symptoms: [],
    causes: [],
    treatments: { organic: [], biological: [], chemical: [] },
    prevention: [],
    follow_up: ""
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
  follow_up: z.string().optional(),
  // Plain-language description of what is visible in the photo:
  // the plant identity, the plant part shown, the visual context and signs.
  // Provided in BOTH English and Urdu so a layman can read either.
  image_description: z
    .object({
      plant: z.string().default(""),
      en: z.string().default(""),
      ur: z.string().default("")
    })
    .default({ plant: "", en: "", ur: "" }),
  // Parallel Urdu translation of the main diagnosis fields. Always populated
  // so the result view can show English + Urdu side-by-side everywhere.
  translations: z
    .object({
      ur: UrdurTranslationsSchema
    })
    .default({
      ur: {
        disease: "",
        symptoms: [],
        causes: [],
        treatments: { organic: [], biological: [], chemical: [] },
        prevention: [],
        follow_up: ""
      }
    })
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;
export type Treatment = z.infer<typeof TreatmentSchema>;
