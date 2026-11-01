
"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AvatarAppearance = {
  skin?: string;
  hair?: string;
  shirt?: string;
  pants?: string;
  shoes?: string;
  eyeColor?: string;
};

type Props = {
  appearance?: AvatarAppearance;
  moving?: boolean;
};

export default function AvatarBase({
  appearance = {},
  moving = false,
}: Props) {
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  const colors = {
    skin: appearance.skin ?? "#C98F70",
    hair: appearance.hair ?? "#49332D",
    shirt: appearance.shirt ?? "#8B78E8",
    pants: appearance.pants ?? "#30384F",
    shoes: appearance.shoes ?? "#F1F0F7",
    eyes: appearance.eyeColor ?? "#38251F",
  };

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const cycle = t * 9;
    const amount = moving ? 1 : 0;

    if (leftArm.current) {
      leftArm.current.rotation.x = THREE.MathUtils.damp(
        leftArm.current.rotation.x,
        Math.sin(cycle + Math.PI) * 0.48 * amount,
        12,
        delta
      );
    }

    if (rightArm.current) {
      rightArm.current.rotation.x = THREE.MathUtils.damp(
        rightArm.current.rotation.x,
        Math.sin(cycle) * 0.48 * amount,
        12,
        delta
      );
    }

    if (leftLeg.current) {
      leftLeg.current.rotation.x = THREE.MathUtils.damp(
        leftLeg.current.rotation.x,
        Math.sin(cycle) * 0.55 * amount,
        12,
        delta
      );
    }

    if (rightLeg.current) {
      rightLeg.current.rotation.x = THREE.MathUtils.damp(
        rightLeg.current.rotation.x,
        Math.sin(cycle + Math.PI) * 0.55 * amount,
        12,
        delta
      );
    }

    if (body.current) {
      const targetY = moving
        ? Math.abs(Math.sin(cycle * 0.5)) * 0.045
        : Math.sin(t * 2) * 0.012;

      body.current.position.y = THREE.MathUtils.damp(
        body.current.position.y,
        targetY,
        10,
        delta
      );
    }
  });

  const mat = (color: string, roughness = 0.72) => (
    <meshStandardMaterial color={color} roughness={roughness} />
  );

  return (
    <group>
      <group ref={body}>
        {/* Tronco */}
        <mesh position={[0, 1.12, 0]} castShadow>
          <capsuleGeometry args={[0.255, 0.43, 6, 12]} />
          {mat(colors.shirt)}
        </mesh>

        {/* Pescoço */}
        <mesh position={[0, 1.48, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.095, 0.16, 16]} />
          {mat(colors.skin)}
        </mesh>

        {/* Cabeça */}
        <group position={[0, 1.78, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.34, 32, 24]} />
            {mat(colors.skin)}
          </mesh>

          {/* Orelhas */}
          <mesh position={[-0.325, -0.015, 0]} castShadow>
            <sphereGeometry args={[0.075, 16, 12]} />
            {mat(colors.skin)}
          </mesh>
          <mesh position={[0.325, -0.015, 0]} castShadow>
            <sphereGeometry args={[0.075, 16, 12]} />
            {mat(colors.skin)}
          </mesh>

          {/* Cabelo */}
          <mesh
            position={[0, 0.19, -0.015]}
            scale={[1.02, 0.72, 1.02]}
            castShadow
          >
            <sphereGeometry
              args={[0.335, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.58]}
            />
            {mat(colors.hair)}
          </mesh>

          <mesh
            position={[0, 0.075, 0.285]}
            scale={[0.55, 0.24, 0.25]}
            castShadow
          >
            <sphereGeometry args={[0.18, 20, 16]} />
            {mat(colors.hair)}
          </mesh>

          {/* Olhos */}
          {([-0.115, 0.115] as const).map((x) => (
            <group key={x} position={[x, -0.025, 0.296]}>
              <mesh scale={[1, 1.18, 0.48]}>
                <sphereGeometry args={[0.047, 20, 16]} />
                {mat("#FFFDFB", 0.35)}
              </mesh>

              <mesh position={[0, 0, 0.019]} scale={[1, 1, 0.5]}>
                <sphereGeometry args={[0.026, 16, 12]} />
                {mat(colors.eyes, 0.3)}
              </mesh>

              <mesh position={[0.008, 0.01, 0.031]} scale={0.35}>
                <sphereGeometry args={[0.012, 12, 8]} />
                {mat("#FFFFFF", 0.2)}
              </mesh>
            </group>
          ))}

          {/* Nariz e sorriso */}
          <mesh position={[0, -0.105, 0.33]} scale={[0.55, 0.7, 0.55]}>
            <sphereGeometry args={[0.045, 16, 12]} />
            {mat(colors.skin)}
          </mesh>

          <mesh position={[0, -0.19, 0.302]} scale={[1, 0.28, 0.18]}>
            <sphereGeometry args={[0.055, 16, 12]} />
            {mat("#8D4E50")}
          </mesh>
        </group>

        {/* Braço esquerdo */}
        <group ref={leftArm} position={[-0.29, 1.36, 0]}>
          <mesh
            position={[0, -0.19, 0]}
            rotation={[0, 0, -0.12]}
            castShadow
          >
            <capsuleGeometry args={[0.085, 0.28, 5, 10]} />
            {mat(colors.shirt)}
          </mesh>

          <mesh position={[-0.025, -0.43, 0]} castShadow>
            <sphereGeometry args={[0.075, 16, 12]} />
            {mat(colors.skin)}
          </mesh>
        </group>

        {/* Braço direito */}
        <group ref={rightArm} position={[0.29, 1.36, 0]}>
          <mesh
            position={[0, -0.19, 0]}
            rotation={[0, 0, 0.12]}
            castShadow
          >
            <capsuleGeometry args={[0.085, 0.28, 5, 10]} />
            {mat(colors.shirt)}
          </mesh>

          <mesh position={[0.025, -0.43, 0]} castShadow>
            <sphereGeometry args={[0.075, 16, 12]} />
            {mat(colors.skin)}
          </mesh>
        </group>

        {/* Perna esquerda */}
        <group ref={leftLeg} position={[-0.13, 0.63, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.31, 5, 10]} />
            {mat(colors.pants)}
          </mesh>

          <mesh position={[0, -0.42, 0.065]} castShadow>
            <capsuleGeometry args={[0.105, 0.13, 5, 10]} />
            {mat(colors.shoes)}
          </mesh>
        </group>

        {/* Perna direita */}
        <group ref={rightLeg} position={[0.13, 0.63, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.31, 5, 10]} />
            {mat(colors.pants)}
          </mesh>

          <mesh position={[0, -0.42, 0.065]} castShadow>
            <capsuleGeometry args={[0.105, 0.13, 5, 10]} />
            {mat(colors.shoes)}
          </mesh>
        </group>
      </group>
    </group>
  );
}
