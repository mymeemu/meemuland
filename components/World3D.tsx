
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";

function Tree({
  position,
  scale = 1
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.23, 1.6, 8]} />
        <meshStandardMaterial color="#987052" />
      </mesh>

      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.85, 12, 12]} />
        <meshStandardMaterial color="#62a879" roughness={0.9} />
      </mesh>

      <mesh position={[-0.38, 2.35, 0.1]} castShadow>
        <sphereGeometry args={[0.48, 10, 10]} />
        <meshStandardMaterial color="#82bd8b" roughness={0.9} />
      </mesh>

      <mesh position={[0.4, 2.25, -0.1]} castShadow>
        <sphereGeometry args={[0.52, 10, 10]} />
        <meshStandardMaterial color="#4f966a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Flower({
  position,
  color
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.24, 6]} />
        <meshStandardMaterial color="#568b58" />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Bench({
  position,
  rotation = 0
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[1.6, 0.14, 0.48]} />
        <meshStandardMaterial color="#b98560" />
      </mesh>

      <mesh position={[0, 0.72, -0.19]} castShadow>
        <boxGeometry args={[1.6, 0.42, 0.12]} />
        <meshStandardMaterial color="#a87350" />
      </mesh>

      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.23, 0]} castShadow>
          <boxGeometry args={[0.12, 0.48, 0.14]} />
          <meshStandardMaterial color="#55453e" />
        </mesh>
      ))}
    </group>
  );
}

function Fountain() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2.15, 0.36, 48]} />
        <meshStandardMaterial color="#d5d8e5" roughness={0.65} />
      </mesh>

      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[1.72, 1.72, 0.08, 48]} />
        <meshStandardMaterial color="#8cabbc" />
      </mesh>

      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.58, 1.58, 0.08, 48]} />
        <meshStandardMaterial
          color="#69b9d5"
          metalness={0.12}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.38, 0.55, 16]} />
        <meshStandardMaterial color="#d6d9e6" />
      </mesh>

      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.35, 16, 12]} />
        <meshStandardMaterial
          color="#8dd8ed"
          transparent
          opacity={0.85}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

function House({
  position,
  color,
  roofColor
}: {
  position: [number, number, number];
  color: string;
  roofColor: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.5, 3.4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      <mesh position={[0, 2.95, 0]} castShadow>
        <coneGeometry args={[2.9, 1.35, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.85} />
      </mesh>

      <mesh position={[0, 0.85, 1.72]}>
        <boxGeometry args={[0.85, 1.7, 0.08]} />
        <meshStandardMaterial color="#86624e" />
      </mesh>

      {[-1.1, 1.1].map((x) => (
        <group key={x} position={[x, 1.55, 1.74]}>
          <mesh>
            <boxGeometry args={[0.72, 0.72, 0.08]} />
            <meshStandardMaterial color="#a9dce8" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.08, 0.82, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PlazaScene() {
  const paths: [number, number, number][] = [
    [0, 0.045, 3],
    [0, 0.045, 4.1],
    [0, 0.045, 5.2],
    [0, 0.045, 6.3],
    [0, 0.045, 7.4],
    [-1.1, 0.045, 0],
    [-2.2, 0.045, 0],
    [-3.3, 0.045, 0],
    [1.1, 0.045, 0],
    [2.2, 0.045, 0],
    [3.3, 0.045, 0]
  ];

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
    [4.5, 0, -8]
  ];

  return (
    <>
      <color attach="background" args={["#dce9f2"]} />
      <fog attach="fog" args={["#dce9f2", 22, 42]} />

      <ambientLight intensity={1.25} />
      <hemisphereLight
        args={["#ffffff", "#b4c6aa", 1.1]}
      />

      <directionalLight
        position={[8, 15, 7]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* Base do mundo */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[22, 0.7, 22]} />
        <meshStandardMaterial color="#8dbb88" roughness={1} />
      </mesh>

      {/* Gramado */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[21.8, 21.8]} />
        <meshStandardMaterial color="#a6d39a" roughness={1} />
      </mesh>

      {/* Caminhos de pedra */}
      {paths.map((position, index) => (
        <mesh
          key={index}
          position={position}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[1, 0.08, 1]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#e7e0d5" : "#dcd5ca"}
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* Construções ao fundo */}
      <House
        position={[-5.5, 0, -7.2]}
        color="#f2d8c5"
        roofColor="#b77f78"
      />
      <House
        position={[5.5, 0, -7.2]}
        color="#d8e5f2"
        roofColor="#778da9"
      />

      {/* Fonte central */}
      <Fountain />

      {/* Árvores */}
      {trees.map((position, index) => (
        <Tree
          key={index}
          position={position}
          scale={index % 2 === 0 ? 1 : 0.85}
        />
      ))}

      {/* Bancos */}
      <Bench position={[-4, 0, 2.8]} rotation={Math.PI / 2} />
      <Bench position={[4, 0, 2.8]} rotation={-Math.PI / 2} />
      <Bench position={[-4.2, 0, -2.8]} />
      <Bench position={[4.2, 0, -2.8]} />

      {/* Flores decorativas */}
      {[
        [-6, 0, 5],
        [-5.5, 0, 5.5],
        [6, 0, 5],
        [5.5, 0, 5.5],
        [-6, 0, -5],
        [6, 0, -5]
      ].map((position, index) => (
        <Flower
          key={index}
          position={position as [number, number, number]}
          color={index % 2 === 0 ? "#e9a4b5" : "#f5d77d"}
        />
      ))}

      {/* Decoração central do gramado */}
      <mesh position={[0, 0.08, 5.8]}>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 24]} />
        <meshStandardMaterial color="#d6c9ad" />
      </mesh>

      <mesh position={[0, 0.2, 5.8]}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#e8c5a4" />
      </mesh>

      <gridHelper
        args={[22, 22, "#91b68d", "#91b68d"]}
        position={[0, 0.025, 0]}
      />
    </>
  );
}

export default function World3D() {
  return (
    <main className="meemuland-3d">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [15, 17, 19],
          zoom: 43,
          near: 0.1,
          far: 100
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping
        }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Suspense fallback={null}>
          <PlazaScene />
        </Suspense>
      </Canvas>

      <header className="world3d-topbar">
        <div className="world3d-brand">
          <span className="world3d-logo">M</span>
          <div>
            <strong>MEEMULAND</strong>
            <small>Your little social world.</small>
          </div>
        </div>

        <div className="world3d-user">
          <span className="world3d-status" />
          Visitante
        </div>
      </header>

      <div className="world3d-location">
        <span>✦</span>
        <div>
          <strong>Cozy Town</strong>
          <small>Praça Central</small>
        </div>
      </div>

      <div className="world3d-bottom">
        <span>MEEMULAND</span>
        <span>Um pequeno universo de possibilidades.</span>
      </div>

      <style jsx>{`
        .meemuland-3d {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #dce9f2;
          font-family: Arial, sans-serif;
        }

        .meemuland-3d :global(canvas) {
          display: block;
          width: 100%;
          height: 100%;
        }

        .world3d-topbar {
          position: absolute;
          top: 22px;
          left: 28px;
          right: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        .world3d-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #30394b;
        }

        .world3d-logo {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          border-radius: 14px;
          color: white;
          font-size: 21px;
          font-weight: 900;
          background: linear-gradient(135deg, #7668e8, #a78bfa);
          box-shadow: 0 7px 22px #7668e84a;
        }

        .world3d-brand strong,
        .world3d-brand small {
          display: block;
        }

        .world3d-brand strong {
          font-size: 15px;
          letter-spacing: 2px;
        }

        .world3d-brand small {
          margin-top: 3px;
          color: #758092;
          font-size: 11px;
        }

        .world3d-user {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 17px;
          border: 1px solid #ffffffb5;
          border-radius: 30px;
          color: #3d4858;
          background: #ffffffc9;
          backdrop-filter: blur(14px);
          font-size: 13px;
          box-shadow: 0 5px 20px #33415512;
        }

        .world3d-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #61c58b;
        }

        .world3d-location {
          position: absolute;
          top: 95px;
          left: 28px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 16px;
          border-radius: 15px;
          background: #ffffffc9;
          color: #465267;
          backdrop-filter: blur(12px);
          box-shadow: 0 5px 20px #33415512;
        }

        .world3d-location > span {
          color: #8b79e8;
          font-size: 23px;
        }

        .world3d-location strong,
        .world3d-location small {
          display: block;
        }

        .world3d-location strong {
          font-size: 13px;
        }

        .world3d-location small {
          margin-top: 3px;
          color: #8791a0;
          font-size: 11px;
        }

        .world3d-bottom {
          position: absolute;
          bottom: 19px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 17px;
          border-radius: 30px;
          color: #637083;
          background: #ffffffbd;
          backdrop-filter: blur(12px);
          white-space: nowrap;
          font-size: 11px;
        }

        .world3d-bottom span:first-child {
          color: #7768d8;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        @media (max-width: 600px) {
          .world3d-topbar {
            top: 14px;
            left: 14px;
            right: 14px;
          }

          .world3d-location {
            top: 76px;
            left: 14px;
          }

          .world3d-bottom {
            bottom: 12px;
            font-size: 9px;
          }

          .world3d-brand strong {
            font-size: 12px;
          }

          .world3d-brand small {
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  );
}
