import "server-only";

const BASE = "https://integrate.api.nvidia.com/v1";

export const NIM_MODELS = {
  visionLarge: "meta/llama-3.2-90b-vision-instruct",
  visionFast: "meta/llama-3.2-11b-vision-instruct",
  llmLarge: "meta/llama-3.3-70b-instruct",
  llmChat: "nvidia/llama-3.1-nemotron-70b-instruct",
  llmTranslate: "mistralai/mixtral-8x22b-instruct"
} as const;

export type NIMMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

type ChatOpts = {
  model: string;
  messages: NIMMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: false;
  response_format?: { type: "json_object" };
};

export async function nimChat(opts: ChatOpts) {
  const key = process.env.NVIDIA_API_KEY?.trim().replace(/^"|"$/g, "");
  if (!key) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.2,
      top_p: opts.top_p ?? 0.7,
      max_tokens: opts.max_tokens ?? 1024,
      stream: false
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NIM ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices[0]?.message?.content ?? "";
}

/** Extracts the first JSON object found in a model response. */
export function extractJSON<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  // Quick path: parse directly
  try {
    return JSON.parse(raw) as T;
  } catch {
    /* fall through */
  }
  // Find the first {...} block
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
