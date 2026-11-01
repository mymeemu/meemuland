"use client";

import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Player3D() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/stylized-cartoon-3d.glb");

  useEffect(() => {
    // Paleta de cores para o avatar
    const skinMaterial = new THREE.MeshStandardMaterial({ color: "#e0ac69", roughness: 0.6 });
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: "#7668e8", roughness: 0.4 });
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: "#2d3748", roughness: 0.7 });
    const accessoryMaterial = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.3 });

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name.toUpperCase();

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

    const leftArm = scene.getObjectByName("l arm.");
    const rightArm = scene.getObjectByName("R ARM");
    if (leftArm) leftArm.rotation.z = -0.5;
    if (rightArm) rightArm.rotation.z = 0.5;

  }, [scene]);

  return (
    /* AUMENTAMOS AQUI: mude o 0.05 para 1.0 ou 1.25 para ele subir */
    <group ref={group} position={[0, 1.1, 3]}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

useGLTF.preload("/stylized-cartoon-3d.glb");
