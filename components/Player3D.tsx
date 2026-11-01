"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------
   SISTEMA DE CONFIGURAÇÃO E CUSTOMIZAÇÃO DO AVATAR
------------------------------------------------------- */

export type AvatarConfig = {
  skinColor: string;
  hairStyle: "short" | "long" | "spiky" | "afro";
  hairColor: string;
  eyeColor: string;
  topStyle: "tshirt" | "hoodie" | "crop";
  topColor: string;
  bottomStyle: "shorts" | "pants";
  bottomColor: string;
  shoesColor: string;
};

const defaultConfig: AvatarConfig = {
  skinColor: "#f5c6a5",
  hairStyle: "long",
  hairColor: "#4a2e1b",
  eyeColor: "#2b1e1a",
  topStyle: "tshirt",
  topColor: "#3b82f6",
  bottomStyle: "shorts",
  bottomColor: "#ffffff",
  shoesColor: "#1e293b",
};

/* -------------------------------------------------------
   ESTRUTURA DO MAPA & PATHFINDING (A*)
------------------------------------------------------- */

const WORLD_LIMIT = 10.1;
const CELL_SIZE = 0.4;
const GRID_SIZE = Math.floor((WORLD_LIMIT * 2) / CELL_SIZE) + 1;

type GridNode = {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
};

const trees: [number, number][] = [
  [-8, -7], [-8, -3], [-8, 3], [-7, 8],
  [8, -7], [8, -3], [8, 4], [7, 8],
  [-4.5, -8], [4.5, -8],
];

function isBlocked(x: number, z: number) {
  if (x < -WORLD_LIMIT || x > WORLD_LIMIT || z < -WORLD_LIMIT || z > WORLD_LIMIT) return true;
  if (Math.hypot(x, z) < 2.35) return true;

  for (const [treeX, treeZ] of trees) {
    if (Math.hypot(x - treeX, z - treeZ) < 0.48) return true;
  }

  const houses = [
    { x: -5.5, z: -7.2, width: 4.55, depth: 3.95 },
    { x: 5.5, z: -7.2, width: 4.55, depth: 3.95 },
  ];

  for (const house of houses) {
    if (Math.abs(x - house.x) < house.width / 2 && Math.abs(z - house.z) < house.depth / 2) return true;
  }

  const benches = [
    { x: -4, z: 2.8, width: 0.85, depth: 1.95 },
    { x: 4, z: 2.8, width: 0.85, depth: 1.95 },
    { x: -4.2, z: -2.8, width: 1.95, depth: 0.85 },
    { x: 4.2, z: -2.8, width: 0.85, depth: 1.95 },
  ];

  for (const bench of benches) {
    if (Math.abs(x - bench.x) < bench.width / 2 && Math.abs(z - bench.z) < bench.depth / 2) return true;
  }

  if (Math.hypot(x, z - 5.8) < 0.72) return true;

  return false;
}

function worldToGrid(value: number) {
  return Math.round((value + WORLD_LIMIT) / CELL_SIZE);
}

function gridToWorld(value: number) {
  return value * CELL_SIZE - WORLD_LIMIT;
}

function findPath(startX: number, startZ: number, endX: number, endZ: number): THREE.Vector3[] {
  const start = { x: worldToGrid(startX), z: worldToGrid(startZ) };
  const end = { x: worldToGrid(endX), z: worldToGrid(endZ) };

  const insideGrid = (x: number, z: number) => x >= 0 && z >= 0 && x < GRID_SIZE && z < GRID_SIZE;
  const blocked = (x: number, z: number) => !insideGrid(x, z) || isBlocked(gridToWorld(x), gridToWorld(z));

  function findNearbyFree(origin: { x: number; z: number }, maxRadius: number) {
    if (!blocked(origin.x, origin.z)) return { ...origin };
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
          const x = origin.x + dx;
          const z = origin.z + dz;
          if (!blocked(x, z)) return { x, z };
        }
      }
    }
    return null;
  }

  const startPosition = findNearbyFree(start, 5);
  const destination = findNearbyFree(end, 8);

  if (!startPosition || !destination) return [];

  const key = (x: number, z: number) => `${x},${z}`;
  const heuristic = (x: number, z: number) => {
    const dx = Math.abs(destination.x - x);
    const dz = Math.abs(destination.z - z);
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
  };

  const open: GridNode[] = [{
    ...startPosition,
    g: 0,
    h: heuristic(startPosition.x, startPosition.z),
    f: heuristic(startPosition.x, startPosition.z),
    parent: null,
  }];

  const closed = new Set<string>();
  const directions = [
    [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],
    [-1, -1, Math.SQRT2], [-1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2], [1, 1, Math.SQRT2],
  ];

  let finalNode: GridNode | null = null;
  let iterations = 0;

  while (open.length > 0 && iterations < 12000) {
    iterations++;
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;

    if (current.x === destination.x && current.z === destination.z) {
      finalNode = current;
      break;
    }

    const currentKey = key(current.x, current.z);
    if (closed.has(currentKey)) continue;
    closed.add(currentKey);

    for (const [dx, dz, cost] of directions) {
      const nextX = current.x + dx;
      const nextZ = current.z + dz;

      if (blocked(nextX, nextZ)) continue;
      if (closed.has(key(nextX, nextZ))) continue;

      if (dx !== 0 && dz !== 0 && (blocked(current.x + dx, current.z) || blocked(current.x, current.z + dz))) continue;

      const nextG = current.g + cost;
      const existing = open.find((node) => node.x === nextX && node.z === nextZ);

      if (existing && existing.g <= nextG) continue;

      const h = heuristic(nextX, nextZ);
      const nextNode: GridNode = {
        x: nextX, z: nextZ, g: nextG, h, f: nextG + h, parent: current,
      };

      if (existing) Object.assign(existing, nextNode);
      else open.push(nextNode);
    }
  }

  if (!finalNode) return [];

  const reversed: THREE.Vector3[] = [];
  let node: GridNode | null = finalNode;

  while (node) {
    reversed.push(new THREE.Vector3(gridToWorld(node.x), 0.08, gridToWorld(node.z)));
    node = node.parent;
  }

  reversed.reverse();
  if (reversed.length <= 2) return reversed;

  const simplified: THREE.Vector3[] = [reversed[0]];
  for (let i = 1; i < reversed.length - 1; i++) {
    const previous = reversed[i - 1];
    const current = reversed[i];
    const next = reversed[i + 1];

    const dirA = new THREE.Vector2(Math.sign(current.x - previous.x), Math.sign(current.z - previous.z));
    const dirB = new THREE.Vector2(Math.sign(next.x - current.x), Math.sign(next.z - current.z));

    if (!dirA.equals(dirB)) simplified.push(current);
  }

  simplified.push(reversed[reversed.length - 1]);
  return simplified;
}
/* -------------------------------------------------------
   MODELO 3D PROCEDIMENTAL - ESTILO MINIMUNDOS / URBANO
------------------------------------------------------- */

type ProceduralAvatarProps = {
  config: AvatarConfig;
  walkingRef: React.MutableRefObject<boolean>;
};

function ProceduralAvatar({ config, walkingRef }: ProceduralAvatarProps) {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const walking = walkingRef.current;
    const phase = state.clock.elapsedTime * 12;
    const swing = walking ? Math.sin(phase) * 0.4 : 0;
    const armSwing = walking ? Math.sin(phase) * 0.3 : 0;

    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;
  });

  // Materiais refinados
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5c3826", roughness: 0.4 }), []); // Tom moreno/negro da referência
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8b2500", roughness: 0.7 }), []); // Ruivo / Castanho avermelhado dos dreads
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.2 }), []);
  const glassesMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 }), []);
  const topMat = useMemo(() => new THREE.MeshStandardMaterial({ color: config.topColor, roughness: 0.5 }), [config.topColor]);
  const bottomMat = useMemo(() => new THREE.MeshStandardMaterial({ color: config.bottomColor, roughness: 0.5 }), [config.bottomColor]);
  const shoeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: config.shoesColor, roughness: 0.3 }), [config.shoesColor]);

  return (
    <group position={[0, 0.65, 0]}>
      {/* ================= ESTILO MINIMUNDOS (CABEÇA MAIOR E EXPRESSIVA) ================= */}
      
      {/* Cabeça Principal */}
      <mesh position={[0, 0.6, 0]} material={skinMat}>
        <sphereGeometry args={[0.26, 32, 32]} />
      </mesh>

      {/* Laterais raspadas (Degradê simulado) */}
      <mesh position={[0, 0.58, 0]} material={hairMat}>
        <cylinderGeometry args={[0.265, 0.265, 0.18, 32]} />
      </mesh>

      {/* Coque Volumoso com Dreads no Topo */}
      <group position={[0, 0.82, -0.02]}>
        <mesh material={hairMat}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
        {/* Detalhes de tranças/dreads espalhados no coque */}
        <mesh position={[0.05, 0.08, 0.05]} material={hairMat} rotation={[0.2, 0.3, 0]}>
          <capsuleGeometry args={[0.04, 0.18, 8, 8]} />
        </mesh>
        <mesh position={[-0.06, 0.06, -0.04]} material={hairMat} rotation={[-0.3, -0.2, 0]}>
          <capsuleGeometry args={[0.04, 0.18, 8, 8]} />
        </mesh>
        <mesh position={[0.02, 0.1, -0.05]} material={hairMat} rotation={[-0.2, 0.4, 0]}>
          <capsuleGeometry args={[0.035, 0.16, 8, 8]} />
        </mesh>
      </group>

      {/* Óculos Estilosos (Baseados na Referência) */}
      <group position={[0, 0.62, 0.2]}>
        {/* Lente Esquerda */}
        <mesh position={[-0.08, 0, 0]} material={glassesMat}>
          <boxGeometry args={[0.07, 0.04, 0.02]} />
        </mesh>
        {/* Lente Direita */}
        <mesh position={[0.08, 0, 0]} material={glassesMat}>
          <boxGeometry args={[0.07, 0.04, 0.02]} />
        </mesh>
        {/* Ponte dos óculos */}
        <mesh position={[0, 0.01, 0]} material={glassesMat}>
          <boxGeometry args={[0.05, 0.01, 0.01]} />
        </mesh>
      </group>

      {/* Olhos Expressivos */}
      <mesh position={[-0.08, 0.59, 0.18]} material={eyeMat}>
        <boxGeometry args={[0.04, 0.02, 0.02]} />
      </mesh>
      <mesh position={[0.08, 0.59, 0.18]} material={eyeMat}>
        <boxGeometry args={[0.04, 0.02, 0.02]} />
      </mesh>

      {/* ================= CORPO COMPACTO (PROPORÇÃO CHIBI) ================= */}

      {/* Pescoço */}
      <mesh position={[0, 0.38, 0]} material={skinMat}>
        <cylinderGeometry args={[0.06, 0.065, 0.08, 16]} />
      </mesh>

      {/* Tronco / Roupa */}
      <mesh position={[0, 0.12, 0]} material={topMat}>
        <cylinderGeometry args={[0.16, 0.13, 0.35, 32]} />
      </mesh>

      {/* Braço Esquerdo */}
      <group ref={leftArmRef} position={[-0.21, 0.25, 0]}>
        <mesh position={[0, -0.12, 0]} material={topMat}>
          <capsuleGeometry args={[0.045, 0.22, 16, 16]} />
        </mesh>
      </group>

      {/* Braço Direito */}
      <group ref={rightArmRef} position={[0.21, 0.25, 0]}>
        <mesh position={[0, -0.12, 0]} material={topMat}>
          <capsuleGeometry args={[0.045, 0.22, 16, 16]} />
        </mesh>
      </group>

      {/* Perna Esquerda */}
      <group ref={leftLegRef} position={[-0.08, -0.1, 0]}>
        <mesh position={[0, -0.15, 0]} material={bottomMat}>
          <capsuleGeometry args={[0.05, 0.25, 16, 16]} />
        </mesh>
        {/* Sapato */}
        <mesh position={[0, -0.34, 0.02]} material={shoeMat}>
          <boxGeometry args={[0.09, 0.06, 0.15]} />
        </mesh>
      </group>

      {/* Perna Direita */}
      <group ref={rightLegRef} position={[0.08, -0.1, 0]}>
        <mesh position={[0, -0.15, 0]} material={bottomMat}>
          <capsuleGeometry args={[0.05, 0.25, 16, 16]} />
        </mesh>
        {/* Sapato */}
        <mesh position={[0, -0.34, 0.02]} material={shoeMat}>
          <boxGeometry args={[0.09, 0.06, 0.15]} />
        </mesh>
      </group>
    </group>
  );
}
/* -------------------------------------------------------
   JOGADOR E MOVIMENTAÇÃO NATIVA (EXPORTAÇÃO DEFAULT)
------------------------------------------------------- */

export default function Player3D() {
  const playerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const pathRef = useRef<THREE.Vector3[]>([]);
  const pathIndexRef = useRef(0);
  const walkingRef = useRef(false);

  const [target, setTarget] = useState<[number, number, number] | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultConfig);

  useEffect(() => {
    const saved = localStorage.getItem("meemu_avatar_config");
    if (saved) {
      try {
        setAvatarConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar avatarConfig", e);
      }
    }
  }, []);

  const direction = useRef(new THREE.Vector3());
  const speed = 2.8;

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    const path = pathRef.current;
    const currentPoint = path[pathIndexRef.current];

    if (currentPoint) {
      direction.current.subVectors(currentPoint, player.position);
      direction.current.y = 0;

      const distance = direction.current.length();

      if (distance > 0.07) {
        walkingRef.current = true;
        direction.current.normalize();

        player.position.addScaledVector(direction.current, Math.min(speed * delta, distance));

        const angle = Math.atan2(direction.current.x, direction.current.z);
        player.rotation.y = THREE.MathUtils.damp(player.rotation.y, angle, 9, delta);

        if (bodyRef.current) {
          const walking = state.clock.elapsedTime * 10;
          bodyRef.current.position.y = Math.abs(Math.sin(walking * 2)) * 0.018;
        }
      } else {
        player.position.x = currentPoint.x;
        player.position.z = currentPoint.z;

        pathIndexRef.current++;

        if (pathIndexRef.current >= path.length) {
          pathRef.current = [];
          pathIndexRef.current = 0;
          walkingRef.current = false;
          setTarget(null);
        }
      }
    } else {
      walkingRef.current = false;
      if (bodyRef.current) bodyRef.current.position.y = 0;
    }
  });

  function handleGroundClick(event: { stopPropagation: () => void; point: THREE.Vector3 }) {
    event.stopPropagation();
    const point = event.point;

    const newPath = findPath(
      playerRef.current?.position.x ?? 0,
      playerRef.current?.position.z ?? 2,
      point.x,
      point.z
    );

    if (newPath.length === 0) return;

    pathRef.current = newPath;
    pathIndexRef.current = 0;

    const destination = newPath[newPath.length - 1];
    setTarget([destination.x, 0.075, destination.z]);
  }

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]} onClick={handleGroundClick}>
        <planeGeometry args={[21.5, 21.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {target && (
        <group position={[target[0], target[1], target[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.29, 32]} />
            <meshBasicMaterial color="#635bff" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.34, 0.37, 32]} />
            <meshBasicMaterial color="#a99cff" transparent opacity={0.45} />
          </mesh>
        </group>
      )}

      <group ref={playerRef} position={[0, 0.08, 2]}>
        <group ref={bodyRef}>
          <ProceduralAvatar config={avatarConfig} walkingRef={walkingRef} />
        </group>
      </group>
    </>
  );
}
