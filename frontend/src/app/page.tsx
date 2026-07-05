"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Prompt } from "@prisma/client";
import { fetchPrompts } from "@/lib/apiClient";

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    fetchPrompts()
      .then(setPrompts)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white w-screen h-screen flex flex-col items-center p-10">
      <div className="bg-gray-400 w-[90%] rounded-xl p-10">
        <Link
          className="rounded-xl bg-green-600 p-5 border border-white border-2 hover:bg-green-800"
          href="/promptCreation"
        >
          Create Prompt
        </Link>
      </div>

      <div className="flex flex-col w-[90%] mt-6">
        {prompts.length === 0 ? (
          <p className="text-gray-600">No prompts yet.</p>
        ) : (
          prompts.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/promptPlayground/${prompt.id}`}
              className="text-black bg-gray-200 p-3 mb-2"
            >
              {prompt.Name}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
