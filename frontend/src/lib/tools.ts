export type ToolOption = {
  id: string;
  name: string;
  description: string;
};

export const TOOLS: ToolOption[] = [
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c1",
    name: "web_search",
    description: "Search the web for information and retrieve current data",
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c2",
    name: "calculator",
    description: "Perform mathematical calculations and arithmetic operations",
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c3",
    name: "code_interpreter",
    description: "Execute and interpret code in various programming languages",
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c4",
    name: "http_request",
    description: "Make HTTP requests to external APIs and retrieve responses",
  },
];
