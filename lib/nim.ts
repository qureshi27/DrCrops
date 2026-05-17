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

/** Extract a JSON object from a model response that may include
 *  markdown code fences, prose preambles, or trailing commentary. */
export function extractJSON<T = unknown>(raw: string): T | null {
  if (!raw) return null;

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  // Quick path: direct parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through */
  }

  // Brace-balanced scan — handle nested objects and find the largest balanced block.
  const first = cleaned.indexOf("{");
  if (first === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  let bestEnd = -1;
  for (let i = first; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        bestEnd = i;
        break;
      }
    }
  }
  if (bestEnd === -1) return null;

  const candidate = cleaned.slice(first, bestEnd + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Last attempt: lenient cleanup — remove trailing commas before } or ]
    const repaired = candidate.replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(repaired) as T;
    } catch {
      return null;
    }
  }
}
