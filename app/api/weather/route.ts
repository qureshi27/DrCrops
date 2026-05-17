import { NextRequest, NextResponse } from "next/server";

// Free, no-key weather provider — Open-Meteo.
// We use it server-side so the client doesn't have to know the URL.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") ?? "31.5497"; // Lahore default
  const lon = searchParams.get("lon") ?? "74.3436";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code"
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      return NextResponse.json({ error: "weather_failed" }, { status: 502 });
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 }
    );
  }
}
