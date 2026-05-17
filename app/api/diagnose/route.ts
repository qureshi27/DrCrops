import { NextRequest, NextResponse } from "next/server";
import { NIM_MODELS, extractJSON, nimChat } from "@/lib/nim";
import { DiagnosisSchema, type Diagnosis } from "@/lib/diagnosis-schema";
import { LOCALES, type Locale } from "@/lib/i18n/languages";

export const runtime = "nodejs";
export const maxDuration = 90;

const SYSTEM = `You are an expert plant pathologist for Pakistani agriculture. You will see a photograph. Your task is to identify the disease, pest, deficiency, or disorder visible — across ALL plant parts including roots, root crowns, tubers, bulbs, rhizomes, stems, bark, leaves, flowers, fruits, pods, seeds, and seedlings.

Below-ground & seedling cases to consider (this matters — do not default to leaf diseases):
- Damping-off (Pythium / Phytophthora / Rhizoctonia / Fusarium) — collapsed seedlings, water-soaked stems at soil line, white mycelium on stem base, sclerotia in soil.
- Root rot — Fusarium, Verticillium, Rhizoctonia, Macrophomina (charcoal rot), Pythium, Phytophthora, Sclerotium collar rot, Dematophora.
- Nematode galls (Meloidogyne) — knotted/swollen roots.
- Bacterial wilt (Ralstonia), red rot of sugarcane, citrus gummosis, mango sudden decline, foot rot of citrus, common scab of potato, black scurf of potato.

Other categories to weigh: rusts, smuts, blights, mildews (powdery/downy), mosaic virus, leaf curl virus, anthracnose, canker, sooty mould, pest damage (whitefly / aphid / thrips / mite / mealybug / borer / armyworm / pink bollworm / fruit fly / leaf miner), nutrient deficiencies (N, K, Mg, Zn, Fe, B, S).

Output rules — STRICT:
- Reply with ONE valid JSON object and NOTHING ELSE. No prose. No "Here is…". No markdown code fences. No trailing comments.
- Recommend chemicals registered in Pakistan; avoid banned actives (monocrotophos, endosulfan, methamidophos, carbofuran).
- Use Pakistani trade names where common (Topsin-M, Antracol, Score, Nativo, Confidor, Coragen, Polo, Tihan, Imidacloprid 25 WG, Tebuconazole 250 EC).
- Doses per acre (1 acre ≈ 0.4 ha) in ml/g or 50-kg bags.
- If image is clearly not a plant: set is_plant=false, disease="not_a_plant", confidence=0.
- Be conservative on confidence: blurry/distant/partial photo → confidence below 60.

JSON schema:
{
  "is_plant": boolean,
  "crop": string|null,
  "disease": string,
  "scientific_name": string|null,
  "confidence": number,
  "severity": "none"|"mild"|"moderate"|"severe",
  "affected_parts": string[],
  "symptoms": string[],
  "causes": string[],
  "spread_risk": "low"|"moderate"|"high",
  "treatments": {
    "organic":    [{"name":"...","dose":"...","timing":"...","notes":"..."}],
    "biological": [{"name":"...","active_ingredient":"...","dose":"...","timing":"...","notes":"..."}],
    "chemical":   [{"name":"...","active_ingredient":"...","dose":"...","timing":"...","notes":"..."}]
  },
  "prevention": string[],
  "urgency": "routine"|"this_week"|"immediate",
  "follow_up": string,
  "image_description": {
    "plant": "...",   // common name e.g. "Wheat seedling", "Cotton leaf (mature)", "Mango fruit"
    "en": "...",      // 2-3 sentences in plain English explaining what is in the photo: plant identity, plant part, visible context and signs
    "ur": "..."       // SAME 2-3 sentences translated into Urdu script (اردو) — always provided regardless of UI language
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      imageBase64: string;
      mime?: string;
      crop?: string;
      lang?: Locale;
      notes?: string;
    };

    if (!body?.imageBase64) {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }

    const lang = LOCALES.find((l) => l.code === body.lang)?.code ?? "en";
    const cropHint = body.crop
      ? `The farmer says this is ${body.crop}. Use this as a strong prior.`
      : "Identify the crop from visual cues.";

    const dataUrl = body.imageBase64.startsWith("data:")
      ? body.imageBase64
      : `data:${body.mime ?? "image/jpeg"};base64,${body.imageBase64}`;

    const userText = `${cropHint}
${body.notes ? `Farmer notes: ${body.notes}` : ""}

Look carefully at ALL plant parts visible in the photo (leaves, stems, roots, soil-line area, fruits, flowers). If you see a seedling collapsed at the soil line with rotted stem tissue, consider damping-off. If you see root galls or knots, consider Meloidogyne. Do not default to a leaf disease unless leaves are clearly the affected part.

Translate every human-readable string (disease, symptoms, causes, treatments.*.name/dose/timing/notes, prevention, follow_up) into language code "${lang}". Keep the JSON field NAMES in English. For ur/pa/sd/ps/skr, use the appropriate Arabic-derived script.

For "image_description", ALWAYS fill BOTH "en" and "ur" — provide the same 2-3 sentence narrative in English plain language AND in Urdu script. "plant" should be the simple common name a farmer would use. This is shown to a layman before any other detail, so write warmly and clearly, not in technical jargon.

Return ONLY the JSON object.`;

    const raw = await nimChat({
      model: NIM_MODELS.visionLarge,
      temperature: 0.12,
      max_tokens: 2200,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ]
    });

    const parsed = extractJSON<Record<string, unknown>>(raw);
    if (!parsed) {
      return NextResponse.json(
        { error: "model_no_json", raw: raw.slice(0, 800) },
        { status: 502 }
      );
    }

    const coerced = coerceDiagnosis(parsed);
    const validated = DiagnosisSchema.safeParse(coerced);
    if (!validated.success) {
      // Last resort: try a soft fallback so the user sees something
      // rather than a 502.
      const fallback = softFallback(coerced);
      if (fallback) {
        return NextResponse.json({
          diagnosis: fallback,
          model: NIM_MODELS.visionLarge,
          lang,
          degraded: true,
          issues: validated.error.flatten()
        });
      }
      return NextResponse.json(
        { error: "schema_invalid", issues: validated.error.flatten(), raw: coerced },
        { status: 502 }
      );
    }

    return NextResponse.json({
      diagnosis: validated.data,
      model: NIM_MODELS.visionLarge,
      lang
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}

/** Lightly normalise model output before strict schema validation. */
function coerceDiagnosis(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const o: Record<string, unknown> = { ...(input as Record<string, unknown>) };

  // Confidence may be a string like "85" or "85%"
  if (typeof o.confidence === "string") {
    const n = parseFloat((o.confidence as string).replace(/[^\d.]/g, ""));
    if (!Number.isNaN(n)) o.confidence = n;
  }
  if (typeof o.confidence !== "number") o.confidence = 0;

  // Lowercase enum-like strings
  for (const k of ["severity", "urgency", "spread_risk"] as const) {
    if (typeof o[k] === "string") {
      o[k] = (o[k] as string).toLowerCase().trim().replace(/\s+/g, "_");
    }
  }

  // Allow severity synonyms
  if (o.severity === "low") o.severity = "mild";
  if (o.severity === "high") o.severity = "severe";

  // Allow urgency synonyms
  if (o.urgency === "urgent" || o.urgency === "high") o.urgency = "immediate";
  if (o.urgency === "low") o.urgency = "routine";

  // Treatments shape
  if (!o.treatments || typeof o.treatments !== "object") {
    o.treatments = { organic: [], biological: [], chemical: [] };
  } else {
    const t = o.treatments as Record<string, unknown>;
    for (const k of ["organic", "biological", "chemical"]) {
      if (!Array.isArray(t[k])) t[k] = [];
    }
  }

  // Array defaults
  for (const k of ["affected_parts", "symptoms", "causes", "prevention"]) {
    if (!Array.isArray(o[k])) o[k] = [];
  }

  // is_plant default
  if (typeof o.is_plant !== "boolean") o.is_plant = true;

  // image_description shape
  if (!o.image_description || typeof o.image_description !== "object") {
    o.image_description = { plant: "", en: "", ur: "" };
  } else {
    const d = o.image_description as Record<string, unknown>;
    if (typeof d.plant !== "string") d.plant = "";
    if (typeof d.en !== "string") d.en = "";
    if (typeof d.ur !== "string") d.ur = "";
  }

  return o;
}

/** Try to coerce partial output into a usable Diagnosis. */
function softFallback(o: Record<string, unknown>): Diagnosis | null {
  if (typeof o.disease !== "string" || !o.disease) return null;
  return {
    is_plant: o.is_plant !== false,
    crop: typeof o.crop === "string" ? o.crop : null,
    disease: o.disease as string,
    scientific_name:
      typeof o.scientific_name === "string" ? o.scientific_name : null,
    confidence: typeof o.confidence === "number" ? o.confidence : 50,
    severity: (["none", "mild", "moderate", "severe"] as const).includes(
      o.severity as never
    )
      ? (o.severity as Diagnosis["severity"])
      : "moderate",
    affected_parts: Array.isArray(o.affected_parts)
      ? (o.affected_parts as string[])
      : [],
    symptoms: Array.isArray(o.symptoms) ? (o.symptoms as string[]) : [],
    causes: Array.isArray(o.causes) ? (o.causes as string[]) : [],
    spread_risk: (["low", "moderate", "high"] as const).includes(
      o.spread_risk as never
    )
      ? (o.spread_risk as Diagnosis["spread_risk"])
      : "moderate",
    treatments: {
      organic:
        (o.treatments as { organic?: unknown[] })?.organic?.length
          ? ((o.treatments as { organic: Diagnosis["treatments"]["organic"] }).organic)
          : [],
      biological:
        (o.treatments as { biological?: unknown[] })?.biological?.length
          ? ((o.treatments as { biological: Diagnosis["treatments"]["biological"] }).biological)
          : [],
      chemical:
        (o.treatments as { chemical?: unknown[] })?.chemical?.length
          ? ((o.treatments as { chemical: Diagnosis["treatments"]["chemical"] }).chemical)
          : []
    },
    prevention: Array.isArray(o.prevention) ? (o.prevention as string[]) : [],
    urgency: (["routine", "this_week", "immediate"] as const).includes(
      o.urgency as never
    )
      ? (o.urgency as Diagnosis["urgency"])
      : "this_week",
    follow_up: typeof o.follow_up === "string" ? o.follow_up : "",
    image_description: (() => {
      const d = (o.image_description ?? {}) as Record<string, unknown>;
      return {
        plant: typeof d.plant === "string" ? d.plant : "",
        en: typeof d.en === "string" ? d.en : "",
        ur: typeof d.ur === "string" ? d.ur : ""
      };
    })()
  };
}
