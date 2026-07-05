import type { Prompt, Version, Run } from "@prisma/client";

type ListResponse<T> = {
  data: T[];
  page: number;
  pageAmt: number;
  total: number;
  totalPages: number;
};

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed (${res.status})`);
  return res.json();
}

async function sendJSON<T>(url: string, method: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url} failed (${res.status})`);
  return res.json();
}

// --- reads ------------------------------------------------------------------

export async function fetchPrompts(): Promise<Prompt[]> {
  const body = await getJSON<ListResponse<Prompt>>("/api/prompts");
  return body.data;
}

export function fetchPrompt(id: string): Promise<Prompt> {
  return getJSON<Prompt>(`/api/prompts/${id}`);
}

export function fetchVersion(id: string): Promise<Version> {
  return getJSON<Version>(`/api/versions/${id}`);
}

export async function fetchRunsByPrompt(promptId: string): Promise<Run[]> {
  const body = await getJSON<ListResponse<Run>>(
    `/api/runs?Prompt_Id=${encodeURIComponent(promptId)}&order=desc`,
  );
  return body.data;
}

// --- writes -----------------------------------------------------------------

export function updatePrompt(
  id: string,
  data: Record<string, unknown>,
): Promise<Prompt> {
  return sendJSON<Prompt>(`/api/prompts/${id}`, "PATCH", data);
}

export function createVersion(input: {
  name: string;
  description?: string;
  def_temperature: number;
  default_top_p: number;
  default_max_tokens: number;
  message: string;
  prompt_id: string;
}): Promise<Version> {
  return sendJSON<Version>("/api/versions", "POST", input);
}

// Placeholder run record. Model execution is not implemented yet, so the
// model-side fields are stored as empty defaults; only the caller-supplied
// bits (prompt/version, sampling params, quality notes) carry real values.
export function createRun(input: {
  Prompt_Id?: string | null;
  Version_Id?: string | null;
  Temperature?: number;
  Top_P?: number;
  Max_Tokens?: number;
  Output_Quality?: unknown;
}): Promise<Run> {
  return sendJSON<Run>("/api/runs", "POST", {
    Prompt_Id: input.Prompt_Id ?? null,
    Version_Id: input.Version_Id ?? null,
    Model_Company: "OpenAI",
    Model_Name: "",
    Model_Output: {},
    Input_Variables: {},
    Output_Quality: input.Output_Quality ?? {},
    Speed: 0,
    Input_Tokens: 0,
    Output_Tokens: 0,
    Estimated_Cost: 0,
    Formatting_Accuracy: 0,
    Temperature: input.Temperature ?? 0,
    Top_P: input.Top_P ?? 0,
    Max_Tokens: input.Max_Tokens ?? 0,
    Status: "Success",
    Status_Message: "Run record created (model execution not yet implemented)",
  });
}
