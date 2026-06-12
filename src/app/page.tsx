"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoAnimation from "@/components/LogoAnimation";

export default function Home() {
  const router = useRouter();

  return (
    <LogoAnimation
      onComplete={() => {
        router.push("/planner");
      }}
    />
  );
}