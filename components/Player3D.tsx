
"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

const trees: [number, number, number][] = [
  [-8, 0, -7],
  [-8, 0, -3],
  [-8, 0, 3],
  [-7, 0, 8],
  [8, 0, -7],
  [8, 0, -3],
  [8, 0, 4],
  [7, 0, 8],
  [-4.5, 0, -8],
  [4.5, 0, -8],
];

function isBlocked(x: number, z: number) {
  if (
    x < -WORLD_LIMIT ||
    x > WORLD_LIMIT ||
    z < -WORLD_LIMIT ||
    z > WORLD_LIMIT
  ) {
    return true;
  }

  // Fonte central
  if (Math.hypot(x, z) < 2.35) return true;

  // Árvores: bloqueio concentrado no tronco
  for (const [treeX, , treeZ] of trees) {
    if (Math.hypot(x - treeX, z - treeZ) < 0.48) {
      return true;
    }
  }

  // Casas e suas áreas de segurança
  const houses = [
    { x: -5.5, z: -7.2, width: 4.55, depth: 3.95 },
    { x: 5.5, z: -7.2, width: 4.55, depth: 3.95 },
  ];

  for (const house of houses) {
    if (
      Math.abs(x - house.x) < house.width / 2 &&
      Math.abs(z - house.z) < house.depth / 2
    ) {
      return true;
    }
  }

  // Bancos
  const benches = [
    { x: -4, z: 2.8, width: 0.85, depth: 1.95 },
    { x: 4, z: 2.8, width: 0.85, depth: 1.95 },
    { x: -4.2, z: -2.8, width: 1.95, depth: 0.85 },
    { x: 4.2, z: -2.8, width: 1.95, depth: 0.85 },
  ];

  for (const bench of benches) {
    if (
      Math.abs(x - bench.x) < bench.width / 2 &&
      Math.abs(z - bench.z) < bench.depth / 2
    ) {
      return true;
    }
  }

  // Pequena decoração no gramado
  if (Math.hypot(x, z - 5.8) < 0.72) return true;

  return false;
}

function worldToGrid(value: number) {
  return Math.round((value + WORLD_LIMIT) / CELL_SIZE);
}

function gridToWorld(value: number) {
  return value * CELL_SIZE - WORLD_LIMIT;
}

function findPath(
  startX: number,
  startZ: number,
  endX: number,
  endZ: number
): THREE.Vector3[] {
  const start = {
    x: worldToGrid(startX),
    z: worldToGrid(startZ),
  };

  const end = {
    x: worldToGrid(endX),
    z: worldToGrid(endZ),
  };

  const insideGrid = (x: number, z: number) =>
    x >= 0 && z >= 0 && x < GRID_SIZE && z < GRID_SIZE;

  const blocked = (x: number, z: number) =>
    !insideGrid(x, z) ||
    isBlocked(gridToWorld(x), gridToWorld(z));

  // Procura uma posição livre próxima ao destino
  let destination = { ...end };

  if (blocked(destination.x, destination.z)) {
    let found = false;

    for (let radius = 1; radius <= 8 && !found; radius++) {
      for (let dx = -radius; dx <= radius && !found; dx++) {
        for (let dz = -radius; dz <= radius && !found; dz++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;

          const x = end.x + dx;
          const z = end.z + dz;

          if (!blocked(x, z)) {
            destination = { x, z };
            found = true;
          }
        }
      }
    }

    if (!found) return [];
  }

  // Se o ponto inicial estiver numa célula bloqueada,
  // procura uma célula livre próxima
  let startPosition = { ...start };

  if (blocked(startPosition.x, startPosition.z)) {
    let found = false;

    for (let radius = 1; radius <= 5 && !found; radius++) {
      for (let dx = -radius; dx <= radius && !found; dx++) {
        for (let dz = -radius; dz <= radius && !found; dz++) {
          const x = start.x + dx;
          const z = start.z + dz;

          if (!blocked(x, z)) {
            startPosition = { x, z };
            found = true;
          }
        }
      }
    }

    if (!found) return [];
  }

  const key = (x: number, z: number) => `${x},${z}`;

  const heuristic = (x: number, z: number) => {
    const dx = Math.abs(destination.x - x);
    const dz = Math.abs(destination.z - z);
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
  };

  const open: GridNode[] = [];
  const closed = new Set<string>();

  const first: GridNode = {
    ...startPosition,
    g: 0,
    h: heuristic(startPosition.x, startPosition.z),
    f: heuristic(startPosition.x, startPosition.z),
    parent: null,
  };

  open.push(first);

  const directions = [
    [-1, 0, 1],
    [1, 0, 1],
    [0, -1, 1],
    [0, 1, 1],
    [-1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [1, 1, Math.SQRT2],
  ];

  let finalNode: GridNode | null = null;
  let iterations = 0;
  const maxIterations = 12000;

  while (open.length > 0 && iterations < maxIterations) {
    iterations++;

    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;

    if (
      current.x === destination.x &&
      current.z === destination.z
    ) {
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

      // Evita cortar caminho diagonalmente entre obstáculos
      if (dx !== 0 && dz !== 0) {
        if (
          blocked(current.x + dx, current.z) ||
          blocked(current.x, current.z + dz)
        ) {
          continue;
        }
      }

      const nextG = current.g + cost;
      const existing = open.find(
        (node) => node.x === nextX && node.z === nextZ
      );

      if (existing && existing.g <= nextG) continue;

      const h = heuristic(nextX, nextZ);

      const nextNode: GridNode = {
        x: nextX,
        z: nextZ,
        g: nextG,
        h,
        f: nextG + h,
        parent: current,
      };

      if (existing) {
        Object.assign(existing, nextNode);
      } else {
        open.push(nextNode);
      }
    }
  }

  if (!finalNode) return [];

  const reversed: THREE.Vector3[] = [];
  let node: GridNode | null = finalNode;

  while (node) {
    reversed.push(
      new THREE.Vector3(
        gridToWorld(node.x),
        0.08,
        gridToWorld(node.z)
      )
    );

    node = node.parent;
  }

  reversed.reverse();

  // Reduz os pontos intermediários mantendo as mudanças de direção
  if (reversed.length <= 2) return reversed;

  const simplified: THREE.Vector3[] = [reversed[0]];

  for (let i = 1; i < reversed.length - 1; i++) {
    const previous = reversed[i - 1];
    const current = reversed[i];
    const next = reversed[i + 1];

    const directionA = new THREE.Vector2(
      Math.sign(current.x - previous.x),
      Math.sign(current.z - previous.z)
    );

    const directionB = new THREE.Vector2(
      Math.sign(next.x - current.x),
      Math.sign(next.z - current.z)
    );

    if (!directionA.equals(directionB)) {
      simplified.push(current);
    }
  }

  simplified.push(reversed[reversed.length - 1]);

  return simplified;
}

export default function Player3D() {
  const playerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const pathRef = useRef<THREE.Vector3[]>([]);
  const pathIndexRef = useRef(0);

  const [target, setTarget] = useState<[number, number, number] | null>(
    null
  );

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
        direction.current.normalize();

        player.position.addScaledVector(
          direction.current,
          Math.min(speed * delta, distance)
        );

        const angle = Math.atan2(
          direction.current.x,
          direction.current.z
        );

        player.rotation.y = THREE.MathUtils.damp(
          player.rotation.y,
          angle,
          9,
          delta
        );

        const walking = state.clock.elapsedTime * 10;
        const swing = Math.sin(walking) * 0.48;

        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = swing;
        }

        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -swing;
        }

        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -swing * 0.65;
        }

        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = swing * 0.65;
        }

        if (bodyRef.current) {
          bodyRef.current.position.y =
            0.025 + Math.abs(Math.sin(walking * 2)) * 0.025;
        }
      } else {
        player.position.x = currentPoint.x;
        player.position.z = currentPoint.z;

        pathIndexRef.current++;

        if (pathIndexRef.current >= path.length) {
          pathRef.current = [];
          pathIndexRef.current = 0;
          setTarget(null);
        }
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;

      if (bodyRef.current) {
        bodyRef.current.position.y = 0;
      }
    }
  });

  function handleGroundClick(event: {
    stopPropagation: () => void;
    point: THREE.Vector3;
  }) {
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

    setTarget([
      destination.x,
      0.075,
      destination.z,
    ]);
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
        <group
          position={[target[0], target[1], target[2]]}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.29, 32]} />
            <meshBasicMaterial color="#635bff" />
          </mesh>

          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.34, 0.37, 32]} />
            <meshBasicMaterial
              color="#a99cff"
              transparent
              opacity={0.45}
            />
          </mesh>
        </group>
      )}

      {/* Avatar provisório */}
      <group ref={playerRef} position={[0, 0.08, 2]}>
        <group ref={bodyRef}>
          {/* Pernas */}
          <group ref={leftLegRef} position={[-0.13, 0.48, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.085, 0.32, 4, 8]} />
              <meshStandardMaterial color="#34446b" />
            </mesh>

            <mesh position={[0, -0.4, 0.07]} castShadow>
              <boxGeometry args={[0.17, 0.09, 0.28]} />
              <meshStandardMaterial color="#292a38" />
            </mesh>
          </group>

          <group ref={rightLegRef} position={[0.13, 0.48, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.085, 0.32, 4, 8]} />
              <meshStandardMaterial color="#34446b" />
            </mesh>

            <mesh position={[0, -0.4, 0.07]} castShadow>
              <boxGeometry args={[0.17, 0.09, 0.28]} />
              <meshStandardMaterial color="#292a38" />
            </mesh>
          </group>

          {/* Corpo */}
          <mesh position={[0, 0.88, 0]} castShadow>
            <capsuleGeometry args={[0.23, 0.38, 6, 12]} />
            <meshStandardMaterial color="#8b75d9" />
          </mesh>

          {/* Braços */}
          <group ref={leftArmRef} position={[-0.29, 1.02, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
              <meshStandardMaterial color="#e7b995" />
            </mesh>
          </group>

          <group ref={rightArmRef} position={[0.29, 1.02, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
              <meshStandardMaterial color="#e7b995" />
            </mesh>
          </group>

          {/* Pescoço */}
          <mesh position={[0, 1.22, 0]}>
            <cylinderGeometry args={[0.09, 0.1, 0.13, 16]} />
            <meshStandardMaterial color="#e7b995" />
          </mesh>

          {/* Cabeça */}
          <mesh position={[0, 1.48, 0]} castShadow>
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
      </group>
    </>
  );
}
