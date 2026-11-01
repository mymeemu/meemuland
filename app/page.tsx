"use client";

import dynamic from "next/dynamic";

const MeemuProfile = dynamic(
  () => import("@/components/MeemuProfile"),
  { ssr: false }
);

export default function Home() {
  return <MeemuProfile />;
}
