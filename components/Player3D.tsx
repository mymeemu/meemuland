
"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Player3D() {
  const playerRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Vector3 | null>(null);

  const [target, setTarget] = useState<[number, number, number] | null>(null);

  const direction = useRef(new THREE.Vector3());
  const speed = 2.8;

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    const destination = targetRef.current;

    if (destination) {
      direction.current.subVectors(destination, player.position);
      direction.current.y = 0;

      const distance = direction.current.length();

      if (distance > 0.08) {
        direction.current.normalize();

        player.position.addScaledVector(
          direction.current,
          Math.min(speed * delta, distance)
        );

        const angle = Math.atan2(
          direction.current.x,
          direction.current.z
        );

        player.rotation.y = THREE.MathUtils.lerp(
          player.rotation.y,
          angle,
          Math.min(delta * 9, 1)
        );

        const walking = state.clock.elapsedTime * 10;

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walking) * 0.45;
          rightLegRef.current.rotation.x = -Math.sin(walking) * 0.45;
        }
      } else {
        targetRef.current = null;
        setTarget(null);
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  function handleGroundClick(event: any) {
    event.stopPropagation();

    const point = event.point;

    targetRef.current = new THREE.Vector3(point.x, 0.08, point.z);
    setTarget([point.x, 0.08, point.z]);
  }

  return (
    <>
      {/* Área clicável do chão */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.055, 0]}
        onClick={handleGroundClick}
      >
        <planeGeometry args={[21.5, 21.5]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Marcador de destino */}
      {target && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[target[0], 0.075, target[2]]}
        >
          <ringGeometry args={[0.22, 0.29, 32]} />
          <meshBasicMaterial color="#635bff" />
        </mesh>
      )}

      {/* Avatar provisório */}
      <group ref={playerRef} position={[0, 0.08, 2]}>
        {/* Pernas */}
        <group ref={leftLegRef} position={[-0.13, 0.48, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.085, 0.32, 4, 8]} />
            <meshStandardMaterial color="#34446b" />
          </mesh>
          <mesh position={[0, -0.4, 0.07]}>
            <boxGeometry args={[0.17, 0.09, 0.28]} />
            <meshStandardMaterial color="#292a38" />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.13, 0.48, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.085, 0.32, 4, 8]} />
            <meshStandardMaterial color="#34446b" />
          </mesh>
          <mesh position={[0, -0.4, 0.07]}>
            <boxGeometry args={[0.17, 0.09, 0.28]} />
            <meshStandardMaterial color="#292a38" />
          </mesh>
        </group>

        {/* Corpo */}
        <mesh position={[0, 0.88, 0]}>
          <capsuleGeometry args={[0.23, 0.38, 6, 12]} />
          <meshStandardMaterial color="#8b75d9" />
        </mesh>

        {/* Braços */}
        <mesh position={[-0.29, 0.91, 0]}>
          <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
          <meshStandardMaterial color="#e7b995" />
        </mesh>

        <mesh position={[0.29, 0.91, 0]}>
          <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
          <meshStandardMaterial color="#e7b995" />
        </mesh>

        {/* Pescoço */}
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.13, 16]} />
          <meshStandardMaterial color="#e7b995" />
        </mesh>

        {/* Cabeça */}
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.25, 24, 24]} />
          <meshStandardMaterial color="#e7b995" />
        </mesh>

        {/* Cabelo */}
        <mesh position={[0, 1.62, -0.015]}>
          <sphereGeometry
            args={[0.255, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]}
          />
          <meshStandardMaterial color="#49352f" />
        </mesh>

        {/* Olhos */}
        <mesh position={[-0.09, 1.49, 0.22]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#29202a" />
        </mesh>

        <mesh position={[0.09, 1.49, 0.22]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#29202a" />
        </mesh>
      </group>
    </>
  );
}
