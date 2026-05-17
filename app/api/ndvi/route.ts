import { NextRequest, NextResponse } from "next/server";
import { ndviImage, ndviStats, type Polygon } from "@/lib/sentinel";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      polygon: Polygon;
      from?: string;
      to?: string;
      mode?: "image" | "stats" | "both";
      width?: number;
      height?: number;
    };

    if (!body?.polygon || body.polygon.length < 3) {
      return NextResponse.json(
        { error: "polygon required (min 3 [lng,lat] pairs)" },
        { status: 400 }
      );
    }

    const to = body.to ?? new Date().toISOString();
    const from =
      body.from ??
      new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(); // last 120 days
    const mode = body.mode ?? "both";

    const out: { imageDataUrl?: string; stats?: unknown } = {};

    if (mode === "image" || mode === "both") {
      const png = await ndviImage({
        polygon: body.polygon,
        from,
        to,
        width: body.width ?? 512,
        height: body.height ?? 512
      });
      out.imageDataUrl = `data:image/png;base64,${png.toString("base64")}`;
    }
    if (mode === "stats" || mode === "both") {
      out.stats = await ndviStats({ polygon: body.polygon, from, to });
    }
    return NextResponse.json(out);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
