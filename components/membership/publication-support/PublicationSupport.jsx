"use client";
import React from "react";
import { Boxes } from "@/components/ui/background-boxes"
import { cn } from "@/lib/utils";
import Link from "next/link";

export function PublicationSupport() {
  return (
    <div className="h-96 relative w-full overflow-hidden max-w-7xl mx-auto border-2 bg-black dark:bg-slate-900 flex flex-col items-center justify-center rounded-lg">
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20")}>
        Publication Support
      </h1>
      <p className="text-center text-sm max-w-4xl mt-2 text-neutral-300 relative z-20">
      get comprehensive support for your research publications, including guidance on journal selection, manuscript preparation, and submission processes. Our team of experts is here to help you navigate the complexities of academic publishing and maximize the impact of your work.
      </p>
      <Link href="/journals">
        <button className="mt-4 relative z-20 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          Submit Paper
        </button>
      </Link>
    </div>
  );
}