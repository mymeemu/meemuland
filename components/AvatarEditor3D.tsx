
"use client";

import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

function AvatarModel() {
  const { scene } = useGLTF("/meemu-avatar.glb");

  const model = useMemo(() => scene.clone(true), [scene]);

  return (
    <Bounds fit clip observe margin={1.3}>
      <Center>
        <primitive object={model} />
      </Center>
    </Bounds>
  );
}

function AvatarScene() {
  return (
    <>
      <color attach="background" args={["#e9eaff"]} />

      <ambientLight intensity={1.8} />

      <hemisphereLight
        args={["#ffffff", "#b7b3df", 1.5]}
      />

      <directionalLight
        position={[4, 7, 5]}
        intensity={2.2}
        castShadow
      />

      <directionalLight
        position={[-4, 3, -3]}
        intensity={1}
        color="#b6a5ff"
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.9, 0]}
        receiveShadow
      >
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.9}
        />
      </mesh>

      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>

      <OrbitControls
        makeDefault
        enableRotate
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.7}
        minPolarAngle={Math.PI / 2 - 0.35}
        maxPolarAngle={Math.PI / 2 + 0.35}
      />
    </>
  );
}

export default function AvatarEditor3D() {
  return (
    <main className="avatar-editor">
      <header className="editor-header">
        <div className="editor-brand">
          <div className="brand-icon">M</div>
          <div>
            <strong>MEEMULAND</strong>
            <span>Avatar Studio</span>
          </div>
        </div>

        <div className="editor-step">
          <span className="step-dot" />
          Criando seu avatar
        </div>
      </header>

      <section className="editor-content">
        <div className="editor-intro">
          <span className="eyebrow">SEU UNIVERSO, SUA IDENTIDADE</span>
          <h1>Seu avatar começa aqui.</h1>
          <p>
            Prepare sua aparência para viver novas experiências
            no MEEMULAND.
          </p>
        </div>

        <div className="avatar-stage">
          <div className="stage-glow" />

          <Canvas
            shadows
            camera={{
              position: [0, 0.15, 5],
              fov: 35,
              near: 0.1,
              far: 100,
            }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
          >
            <AvatarScene />
          </Canvas>

          <div className="drag-hint">
            <span>↔</span>
            Arraste para girar
          </div>
        </div>

        <div className="editor-footer">
          <span>MEEMULAND</span>
          <span>Seu pequeno universo começa com você.</span>
        </div>
      </section>

      <style jsx>{`
        .avatar-editor {
          position: fixed;
          inset: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: #33344c;
          background:
            radial-gradient(
              ellipse at 50% 55%,
              #ffffff 0%,
              #f0efff 48%,
              #e2eaff 100%
            );
          font-family: Arial, sans-serif;
        }

        .editor-header {
          height: 76px;
          padding: 0 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .editor-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: white;
          font-size: 21px;
          font-weight: 900;
          background: linear-gradient(135deg, #7668e8, #aa91f5);
          box-shadow: 0 5px 18px #8c7be744;
        }

        .editor-brand strong,
        .editor-brand span {
          display: block;
        }

        .editor-brand strong {
          font-size: 14px;
          letter-spacing: 2px;
        }

        .editor-brand span {
          margin-top: 4px;
          color: #9293aa;
          font-size: 11px;
        }

        .editor-step {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 16px;
          border-radius: 30px;
          background: #ffffffa8;
          color: #77758f;
          font-size: 12px;
        }

        .step-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #8d7bea;
          box-shadow: 0 0 10px #8d7bea;
        }

        .editor-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .editor-intro {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 18px 20px 0;
          pointer-events: none;
        }

        .eyebrow {
          color: #9283dc;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
        }

        .editor-intro h1 {
          margin: 10px 0 7px;
          color: #37364f;
          font-size: clamp(25px, 3vw, 37px);
          letter-spacing: -1.2px;
        }

        .editor-intro p {
          margin: 0;
          color: #8889a0;
          font-size: 13px;
        }

        .avatar-stage {
          position: absolute;
          inset: 150px 0 48px;
          overflow: hidden;
          cursor: grab;
        }

        .avatar-stage:active {
          cursor: grabbing;
        }

        .avatar-stage canvas {
          position: relative;
          z-index: 1;
        }

        .stage-glow {
          position: absolute;
          width: min(65vw, 580px);
          height: min(65vw, 580px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -48%);
          border-radius: 50%;
          background: radial-gradient(
            circle,
            #c9c0ff80 0%,
            #dce5ff50 45%,
            transparent 72%
          );
          pointer-events: none;
        }

        .drag-hint {
          position: absolute;
          z-index: 2;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 17px;
          border: 1px solid #ffffffc9;
          border-radius: 30px;
          background: #ffffffbd;
          color: #77758f;
          font-size: 11px;
          white-space: nowrap;
          pointer-events: none;
          backdrop-filter: blur(10px);
        }

        .drag-hint span {
          color: #8877e4;
          font-size: 18px;
        }

        .editor-footer {
          position: absolute;
          z-index: 2;
          bottom: 18px;
          left: 30px;
          right: 30px;
          display: flex;
          justify-content: space-between;
          color: #a0a0b5;
          font-size: 10px;
          letter-spacing: 1px;
          pointer-events: none;
        }

        .editor-footer span:first-child {
          font-weight: 900;
          color: #8879d9;
        }

        @media (max-width: 600px) {
          .editor-header {
            height: 65px;
            padding: 0 16px;
          }

          .editor-step {
            font-size: 10px;
            padding: 9px 11px;
          }

          .editor-intro {
            padding-top: 24px;
          }

          .editor-intro p {
            max-width: 290px;
            line-height: 1.5;
          }

          .avatar-stage {
            inset: 175px 0 55px;
          }

          .editor-footer {
            left: 16px;
            right: 16px;
            bottom: 12px;
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}

useGLTF.preload("/meemu-avatar.glb");
