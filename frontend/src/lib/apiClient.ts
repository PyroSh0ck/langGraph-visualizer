import type { Prompt, Version, Run } from "@prisma/client";
import type { PromptFilters, RunFilters, Message } from "./types";
import type { ModelOption } from "./models";

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

function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

// --- reads ------------------------------------------------------------------

export async function fetchPrompts(filters?: PromptFilters): Promise<Prompt[]> {
  const query = buildQueryString(filters ?? {});
  const body = await getJSON<ListResponse<Prompt>>(`/api/prompts${query}`);
  return body.data;
}

export function fetchPrompt(id: string): Promise<Prompt> {
  return getJSON<Prompt>(`/api/prompts/${id}`);
}

export function fetchVersion(id: string): Promise<Version> {
  return getJSON<Version>(`/api/versions/${id}`);
}

export async function fetchRuns(filters?: RunFilters): Promise<Run[]> {
  const query = buildQueryString({ ...filters, order: "desc" });
  const body = await getJSON<ListResponse<Run>>(`/api/runs${query}`);
  return body.data;
}

export async function fetchRunsByPrompt(promptId: string): Promise<Run[]> {
  return fetchRuns({ Prompt_Id: promptId });
}

export async function fetchVersions(promptId: string): Promise<Version[]> {
  const body = await getJSON<ListResponse<Version>>(
    `/api/versions?Prompt_Id=${encodeURIComponent(promptId)}`,
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
  message?: string;
  messages?: Message[];
  prompt_id: string;
  preferred_model?: string;
  bound_tools?: string[];
  response_schema?: unknown;
  context_schema?: unknown;
}): Promise<Version> {
  const body: Record<string, unknown> = {
    name: input.name,
    description: input.description,
    def_temperature: input.def_temperature,
    default_top_p: input.default_top_p,
    default_max_tokens: input.default_max_tokens,
    prompt_id: input.prompt_id,
  };

  // Support both legacy message and new messages format
  if (input.messages) {
    body.messages = input.messages;
  } else if (input.message) {
    body.message = input.message;
  }

  if (input.preferred_model !== undefined) {
    body.preferred_model = input.preferred_model;
  }
  if (input.bound_tools !== undefined) {
    body.bound_tools = input.bound_tools;
  }
  if (input.response_schema !== undefined) {
    body.response_schema = input.response_schema;
  }
  if (input.context_schema !== undefined) {
    body.context_schema = input.context_schema;
  }

  return sendJSON<Version>("/api/versions", "POST", body);
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
  model?: ModelOption;
  Speed?: number;
  Input_Tokens?: number;
  Output_Tokens?: number;
  Estimated_Cost?: number;
  Formatting_Accuracy?: number;
  modelOutput?: unknown;
}): Promise<Run> {
  const modelCompany = input.model?.provider ?? "OpenAI";
  const modelName = input.model?.model ?? "";

  return sendJSON<Run>("/api/runs", "POST", {
    Prompt_Id: input.Prompt_Id ?? null,
    Version_Id: input.Version_Id ?? null,
    Model_Company: modelCompany,
    Model_Name: modelName,
    Model_Output: input.modelOutput ?? {},
    Input_Variables: {},
    Output_Quality: input.Output_Quality ?? {},
    Speed: input.Speed ?? 0,
    Input_Tokens: input.Input_Tokens ?? 0,
    Output_Tokens: input.Output_Tokens ?? 0,
    Estimated_Cost: input.Estimated_Cost ?? 0,
    Formatting_Accuracy: input.Formatting_Accuracy ?? 0,
    Temperature: input.Temperature ?? 0,
    Top_P: input.Top_P ?? 0,
    Max_Tokens: input.Max_Tokens ?? 0,
    Status: "Success",
    Status_Message: "Run record created (model execution not yet implemented)",
  });
}
