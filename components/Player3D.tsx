"use client";

import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Player3D() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/stylized-cartoon-3d.glb");

  useEffect(() => {
    // Definimos a paleta de cores para o avatar
    const skinMaterial = new THREE.MeshStandardMaterial({ color: "#e0ac69", roughness: 0.6 }); // Cor de pele
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: "#7668e8", roughness: 0.4 }); // Camisa (roxa do MEEMU)
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: "#2d3748", roughness: 0.7 }); // Calça jeans escura
    const accessoryMaterial = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.3 }); // Relógio/Acessórios

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name.toUpperCase();

        // Pinta cada parte de acordo com o nome da malha no GLTF
        if (name.includes("HEAD") || name.includes("HAND") || name.includes("ARM")) {
          mesh.material = skinMaterial;
        } else if (name.includes("TOSO") || name.includes("TORSO")) {
          mesh.material = shirtMaterial;
        } else if (name.includes("LEG") || name.includes("FOOT")) {
          mesh.material = pantsMaterial;
        } else if (name.includes("WATCH")) {
          mesh.material = accessoryMaterial;
        }
      }
    });

    // Baixa ligeiramente os braços para sair da pose em T pura
    const leftArm = scene.getObjectByName("l arm.");
    const rightArm = scene.getObjectByName("R ARM");
    if (leftArm) leftArm.rotation.z = -0.5;
    if (rightArm) rightArm.rotation.z = 0.5;

  }, [scene]);

  return (
    <group ref={group} position={[0, 0.05, 3]}>
      {/* Ajuste o scale se ele estiver muito grande/pequeno */}
      <primitive object={scene} scale={1} />
    </group>
  );
}

useGLTF.preload("/stylized-cartoon-3d.glb");
