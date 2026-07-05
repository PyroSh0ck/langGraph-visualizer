"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Prompt } from "@prisma/client";
import { fetchPrompts, createRun } from "@/lib/apiClient";

function PromptColumn({
  label,
  prompts,
}: {
  label: string;
  prompts: Prompt[];
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return prompts.filter((p) => p.Name.toLowerCase().includes(q));
  }, [query, prompts]);

  const selected =
    prompts.find((p) => p.Name.toLowerCase() === query.trim().toLowerCase()) ??
    null;

  const runPrompt = async () => {
    if (!selected) {
      alert("Select a prompt first");
      return;
    }
    try {
      await createRun({
        Prompt_Id: selected.id,
        Version_Id: selected.Best_Version_Id,
      });
      alert("Run record created!");
    } catch (err) {
      alert(`Failed to create run: ${err}`);
    }
  };

  return (
    <div className="bg-gray-500 w-full flex flex-row">
      <Link
        className="bg-gray-900 text-white rounded-xl p-3"
        href={selected ? `/promptPlayground/${selected.id}` : "#"}
      >
        Edit
      </Link>
      <div className="bg-gray-500 flex flex-col">
        <input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          value={query}
          placeholder={`Type in ${label}:`}
        />
        <div className="bg-gray-300 flex flex-col">
          {matches.map((p) => (
            <button
              key={p.id}
              className="text-black text-left"
              onClick={() => setQuery(p.Name)}
            >
              {p.Name}
            </button>
          ))}
        </div>
        <div className="bg-gray-300 text-black">
          <p>Details: {selected ? selected.Description ?? "(none)" : "—"}</p>
        </div>
      </div>
      <div className="flex flex-col">
        <button
          onClick={runPrompt}
          className="bg-green-400 text-white rounded-xl p-4 m-2"
        >
          Run Prompt
        </button>
        <div className="bg-gray-600 rounded-xl p-5">
          <p>Output</p>
        </div>
      </div>
    </div>
  );
}

export default function PromptCompare() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    fetchPrompts()
      .then(setPrompts)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-black w-screen h-screen flex flex-col justify-center items-center">
      <PromptColumn label="Prompt A" prompts={prompts} />
      <PromptColumn label="Prompt B" prompts={prompts} />
    </div>
  );
}
