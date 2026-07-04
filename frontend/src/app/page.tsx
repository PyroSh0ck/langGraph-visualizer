"use client";
import ModalOne from "@/components/ModalOne";
import Link from "next/link";
import { useState } from "react";
import { Url } from "url";

export default function Home() {
  return (
    <div className="">
      <div className="bg-white w-screen h-screen flex flex-col items-center p-10">
        <div className="bg-gray-400 w-[90%] h-[20%] rounded-xl p-10">
          <Link
            className="rounded-xl bg-green-600 p-5 border border-white border-2 hover:bg-green-800"
            href="/promptCreation"
          >
            Create Prompt
          </Link>
        </div>
      </div>
    </div>
  );
}
