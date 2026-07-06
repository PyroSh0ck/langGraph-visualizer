export type MessageRole = "system" | "human";

export type Message = {
  role: MessageRole;
  content: string;
};

export type PromptFilters = {
  q?: string;
  createdAfter?: string;
  createdBefore?: string;
};

export type RunFilters = {
  q?: string;
  createdAfter?: string;
  createdBefore?: string;
  Prompt_Id?: string;
  Version_Id?: string;
};
