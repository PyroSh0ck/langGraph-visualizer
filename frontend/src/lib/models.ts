export type ModelOption = {
  id: string;
  label: string;
  provider: "OpenAI" | "Anthropic" | "Google" | "Custom";
  model: string;
};

export const MODELS: ModelOption[] = [
  {
    id: "openai-gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
    model: "gpt-4o",
  },
  {
    id: "openai-gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "OpenAI",
    model: "gpt-4o-mini",
  },
  {
    id: "anthropic-opus-4-8",
    label: "Claude Opus 4.8",
    provider: "Anthropic",
    model: "claude-opus-4-8-20250805",
  },
  {
    id: "anthropic-sonnet-5",
    label: "Claude Sonnet 5",
    provider: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
  },
  {
    id: "anthropic-haiku-4-5",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
    model: "claude-haiku-4-5-20251001",
  },
  {
    id: "google-gemini-2-flash",
    label: "Gemini 2.0 Flash",
    provider: "Google",
    model: "gemini-2.0-flash",
  },
];
