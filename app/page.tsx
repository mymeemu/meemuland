"use client";

import dynamic from "next/dynamic";

const AvatarEditor3D = dynamic(
  () => import("@/components/AvatarEditor3D"),
  { ssr: false }
);

export default function Home() {
  return <AvatarEditor3D />;
}
