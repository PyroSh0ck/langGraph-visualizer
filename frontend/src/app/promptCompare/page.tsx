"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function PromptCompare() {
  const [prompt1, setPrompt1] = useState("");
  const [prompt2, setPrompt2] = useState("");
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // query db for prompts
    setPrompt1(e.target.value);
  };
  const changeHandler2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    // query db for prompts
    setPrompt2(e.target.value);
  };

  return (
    <div className="bg-black w-screen h-screen flex flex-col justify-center items-center">
      <div className="bg-gray-500 w-full flex flex-row">
        <Link
          className="bg-gray-900 text-white rounded-xl p-3"
          href="/promptPlayground/1"
        >
          Edit
        </Link>
        <div className="bg-gray-500 flex flex-col">
          <input
            onChange={changeHandler}
            value={prompt1}
            placeholder="Type in Prompt A:"
          />
          <div className="bg-gray-300">
            <p>Details:</p>
          </div>
        </div>
        <div className="flex flex-col">
          <button className="bg-green-400 text-white rounded-xl p-4 m-2">
            Run Prompt
          </button>
          <div className="bg-gray-600 rounded-xl p-5">
            <p>Output</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-500 w-full flex flex-row">
        <Link
          className="bg-gray-900 text-white rounded-xl p-3"
          href="/promptPlayground/2"
        >
          Edit
        </Link>
        <div className="bg-gray-500 flex flex-col">
          <input
            onChange={changeHandler2}
            value={prompt2}
            placeholder="Type in Prompt B:"
          />
          <div className="bg-gray-300">
            <p>Details:</p>
          </div>
        </div>
        <div className="flex flex-col">
          <button className="bg-green-400 text-white rounded-xl p-4 m-2">
            Run Prompt
          </button>
          <div className="bg-gray-600 rounded-xl p-5">
            <p>Output</p>
          </div>
        </div>
      </div>
    </div>
  );
}
