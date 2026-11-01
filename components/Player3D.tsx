"use client";

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export default function Player3D() {
  const group = useRef(null);

  // Carrega o seu modelo novo da pasta public/
  const { scene } = useGLTF("/stylized-cartoon-3d.glb");

  return (
    <group ref={group} position={[0, 0.05, 3]}>
      {/* O primitive renderiza a malha 3D do Sketchfab */}
      {/* Ajuste o scale se o boneco ficar muito grande ou pequeno (ex: scale={0.5} ou scale={1}) */}
      <primitive object={scene} scale={1} castShadow />
    </group>
  );
}

// Pré-carrega o modelo para evitar atrasos na renderização
useGLTF.preload("/stylized-cartoon-3d.glb");
