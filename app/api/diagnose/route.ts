import { NextRequest, NextResponse } from "next/server";
import { NIM_MODELS, extractJSON, nimChat } from "@/lib/nim";
import { DiagnosisSchema } from "@/lib/diagnosis-schema";
import { LOCALES, type Locale } from "@/lib/i18n/languages";

export const runtime = "nodejs";
export const maxDuration = 90;

const STAGE1_SYSTEM = `You are an expert plant pathologist for Pakistani agriculture.

A photograph will be shown. Your task in this turn is OBSERVATION ONLY — do not yet decide a disease. Describe with care:

1. What plant part is visible? (leaf, multiple leaves, stem, branch, whole plant, root, root crown, tuber, bulb, rhizome, fruit, flower, seed pod, soil, harvested produce). Be exact.
2. Visual evidence ONLY. Document: colour patterns (chlorosis, necrosis, mosaic, reddening, browning), lesion shape and edge, pustules / sori / rust colour, mildew (powdery vs downy), wilting, galls/swellings, holes / feeding damage, webbing, frass, insects, eggs, sooty mould, gummosis, cankers, stunting, root knots / rot / discolouration, tuber lesions, fruit spots / rots, sunken or raised tissue, oil spots, ooze, scab, mosaic. Distinguish abiotic stress (nutrient deficiency, water, sunburn, frost, salinity) from biotic.
3. Counts and distribution (how many spots, on which leaves, leaf age — old vs new, side of leaf — adaxial vs abaxial).
4. Image quality and uncertainty (blur, distance, lighting, partial view).

Return a short structured observation in this exact JSON form, NOTHING else:
{
  "plant_part": string,
  "candidate_crop": string|null,
  "visible_evidence": string[],
  "distribution": string,
  "abiotic_signs": string[],
  "biotic_signs": string[],
  "image_quality": "good"|"fair"|"poor",
  "view_completeness": "single_leaf"|"multiple_leaves"|"whole_plant"|"root_or_tuber"|"fruit"|"stem_or_bark"|"flower"|"other"
}`;

const STAGE2_SYSTEM = `You are an expert agricultural pathologist for Pakistan. You receive (1) the photograph and (2) a structured visual-observation note that was just written about it. Use BOTH to produce a final diagnosis.

Be especially thorough for:
- **Root and below-ground problems**: Fusarium wilt, Verticillium wilt, root-knot nematode (Meloidogyne galls), cyst nematode, Pythium / Phytophthora damping-off, Rhizoctonia black scurf on potato, charcoal rot (Macrophomina), bacterial wilt (Ralstonia), white root rot (Dematophora), pink rot, common scab, brown rot of potato, foot rot of citrus, Ganoderma butt rot.
- **Stem / crown / bark**: red rot of sugarcane, smut whip, citrus gummosis, mango sudden decline, sclerotium collar rot, cotton wilt, stem borer galleries, wood rot.
- **Fruit / pod / boll**: anthracnose (mango/chili/citrus), boll rot, bollworm holes, fruit fly stings, sooty mould from honeydew, mango stem-end rot, citrus black spot, blossom-end rot in tomato, late-blight on tomato fruit.
- **Flower / panicle / spike**: ergot, smuts (loose, covered, karnal), panicle blast, sterility.
- **Pests as causes**: whitefly damage, thrips silvering, mites stippling, aphid honeydew + sooty mould, scale insects, mealybug, leaf miner serpentine trails, fall armyworm windowing, jassid hopper-burn, pink bollworm in bolls, fruit fly in mango/citrus.
- **Nutrient deficiencies**: N (uniform older-leaf yellowing), K (marginal scorch), Mg (interveinal of older leaves), Fe / Zn (interveinal of new leaves), B (cracked stems / hollow heart), S (uniform young-leaf yellowing).

Reasoning rules:
- If the observation note says the visible part is root/tuber/crown/stem/fruit/flower — bias your differential to diseases of THAT organ. Do not over-default to leaf diseases.
- If image quality is poor or view_completeness is restrictive, drop confidence below 60.
- Recommend chemicals registered in Pakistan; avoid banned actives (monocrotophos, endosulfan, methamidophos, carbofuran).
- Use trade names common in PK where possible (Topsin-M, Antracol, Score, Nativo, Confidor, Coragen, Polo, Tihan, Imidacloprid, Tebuconazole).
- Doses per acre (1 acre ≈ 0.4 ha). Use ml, g, or 50-kg bags.

Return ONLY a single JSON object with this exact schema and nothing else:
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
    "organic":     [{"name":"...","dose":"...","timing":"...","notes":"..."}],
    "biological":  [{"name":"...","active_ingredient":"...","dose":"...","timing":"...","notes":"..."}],
    "chemical":    [{"name":"...","active_ingredient":"...","dose":"...","timing":"...","notes":"..."}]
  },
  "prevention": string[],
  "urgency": "routine"|"this_week"|"immediate",
  "follow_up": string
}

If the image is clearly not a plant set is_plant=false, disease="not_a_plant", confidence=0.`;

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
      ? `Farmer says this is ${body.crop}. Use as a strong prior.`
      : "Identify the crop from visual cues.";

    const dataUrl = body.imageBase64.startsWith("data:")
      ? body.imageBase64
      : `data:${body.mime ?? "image/jpeg"};base64,${body.imageBase64}`;

    // STAGE 1 — careful observation pass (no diagnosis yet).
    const stage1Raw = await nimChat({
      model: NIM_MODELS.visionLarge,
      temperature: 0.05,
      max_tokens: 700,
      messages: [
        { role: "system", content: STAGE1_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${cropHint}\n${body.notes ? `Farmer notes: ${body.notes}` : ""}\n\nProduce the OBSERVATION JSON only.`
            },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ]
    });

    const observation =
      extractJSON<Record<string, unknown>>(stage1Raw) ?? { raw: stage1Raw };

    // STAGE 2 — final diagnosis using observation + image.
    const stage2User = `OBSERVATION NOTES (from a prior careful look at this same image):
\`\`\`json
${JSON.stringify(observation, null, 2)}
\`\`\`

${cropHint}
${body.notes ? `Farmer notes: ${body.notes}` : ""}

Localize human-readable strings (disease, symptoms, causes, treatments.*.name/dose/timing/notes, prevention, follow_up) into language code "${lang}". Keep JSON field NAMES in English. For ur/pa/sd/ps/skr use the appropriate Arabic-derived script.

Return ONLY the JSON diagnosis object.`;

    const stage2Raw = await nimChat({
      model: NIM_MODELS.visionLarge,
      temperature: 0.1,
      max_tokens: 1800,
      messages: [
        { role: "system", content: STAGE2_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: stage2User },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ]
    });

    const parsed = extractJSON(stage2Raw);
    if (!parsed) {
      return NextResponse.json(
        { error: "model_no_json", raw: stage2Raw.slice(0, 600) },
        { status: 502 }
      );
    }

    const validated = DiagnosisSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "schema_invalid", issues: validated.error.flatten(), raw: parsed },
        { status: 502 }
      );
    }

    return NextResponse.json({
      diagnosis: validated.data,
      observation,
      model: NIM_MODELS.visionLarge,
      lang
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
