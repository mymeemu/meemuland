
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_PATH = "/stylized-cartoon-3d.glb";

const START_POSITION = new THREE.Vector3(0, 1.1, 3);
const WORLD_LIMIT = 9.5;
const MOVE_SPEED = 3.2;

type AnimatedBone = {
  bone: THREE.Bone;
  initialRotation: THREE.Euler;
  type: "arm" | "leg";
  side: number;
};

export default function Player3D() {
  const group = useRef<THREE.Group>(null);
  const destination = useRef<THREE.Vector3 | null>(null);
  const keys = useRef(new Set<string>());
  const clock = useRef(0);
  const moving = useRef(false);

  const { camera, gl } = useThree();
  const { scene } = useGLTF(MODEL_PATH);

  // Clona o modelo para não alterar a cena original do GLTF.
  const avatar = useMemo(() => clone(scene), [scene]);

  // Identifica os ossos disponíveis no rig do modelo.
  const animatedBones = useMemo<AnimatedBone[]>(() => {
    const result: AnimatedBone[] = [];

    avatar.traverse((object) => {
      const bone = object as THREE.Bone;

      if (!bone.isBone) return;

      const name = bone.name.toLowerCase();

      const isArm =
        /arm|shoulder|elbow|forearm|wrist/.test(name);

      const isLeg =
        /thigh|leg|knee|calf|shin|foot/.test(name);

      if (!isArm && !isLeg) return;

      const isLeft = /left|_l\b|\.l\b|^l[_ .]/.test(name);
      const isRight = /right|_r\b|\.r\b|^r[_ .]/.test(name);

      result.push({
        bone,
        initialRotation: bone.rotation.clone(),
        type: isArm ? "arm" : "leg",
        side: isLeft ? -1 : isRight ? 1 : 1,
      });
    });

    return result;
  }, [avatar]);

  // Aplica a paleta original do MEEMULAND.
  useEffect(() => {
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: "#e0ac69",
      roughness: 0.6,
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: "#7668e8",
      roughness: 0.4,
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: "#2d3748",
      roughness: 0.7,
    });

    const accessoryMaterial = new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.3,
    });

    avatar.traverse((child) => {
      const mesh = child as THREE.Mesh;

      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const name = mesh.name.toUpperCase();

      if (
        name.includes("WATCH") ||
        name.includes("ACCESSORY")
      ) {
        mesh.material = accessoryMaterial;
      } else if (
        name.includes("HEAD") ||
        name.includes("HAND") ||
        name.includes("ARM")
      ) {
        mesh.material = skinMaterial;
      } else if (
        name.includes("TOSO") ||
        name.includes("TORSO")
      ) {
        mesh.material = shirtMaterial;
      } else if (
        name.includes("LEG") ||
        name.includes("FOOT")
      ) {
        mesh.material = pantsMaterial;
      }
    });

    return () => {
      skinMaterial.dispose();
      shirtMaterial.dispose();
      pantsMaterial.dispose();
      accessoryMaterial.dispose();
    };
  }, [avatar]);

  // Movimento por teclado.
  useEffect(() => {
    const editableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;

      return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
          target.tagName
        )
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (editableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
      ) {
        keys.current.add(key);
        destination.current = null;
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    const onBlur = () => {
      keys.current.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Clique no chão para definir um destino.
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const ground = new THREE.Plane(
      new THREE.Vector3(0, 1, 0),
      0
    );

    const hit = new THREE.Vector3();

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const rect = gl.domElement.getBoundingClientRect();

      pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

      pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      if (!raycaster.ray.intersectPlane(ground, hit)) return;

      const x = THREE.MathUtils.clamp(
        hit.x,
        -WORLD_LIMIT,
        WORLD_LIMIT
      );

      const z = THREE.MathUtils.clamp(
        hit.z,
        -WORLD_LIMIT,
        WORLD_LIMIT
      );

      destination.current = new THREE.Vector3(x, 0, z);
      keys.current.clear();
    };

    gl.domElement.addEventListener("pointerdown", onPointerDown);

    return () => {
      gl.domElement.removeEventListener(
        "pointerdown",
        onPointerDown
      );
    };
  }, [camera, gl]);

  // Atualização contínua: movimento, direção e animações.
  useFrame((_, delta) => {
    if (!group.current) return;

    const player = group.current;
    const dt = Math.min(delta, 0.05);

    clock.current += dt;

    const direction = new THREE.Vector3();

    const pressed = keys.current;

    if (pressed.has("w") || pressed.has("arrowup")) {
      direction.z -= 1;
    }

    if (pressed.has("s") || pressed.has("arrowdown")) {
      direction.z += 1;
    }

    if (pressed.has("a") || pressed.has("arrowleft")) {
      direction.x -= 1;
    }

    if (pressed.has("d") || pressed.has("arrowright")) {
      direction.x += 1;
    }

    // Movimento contínuo pelo teclado.
    if (direction.lengthSq() > 0) {
      direction.normalize();

      player.position.x += direction.x * MOVE_SPEED * dt;
      player.position.z += direction.z * MOVE_SPEED * dt;

      destination.current = null;
    } else if (destination.current) {
      // Movimento até ao ponto selecionado.
      const target = destination.current;

      const dx = target.x - player.position.x;
      const dz = target.z - player.position.z;

      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < 0.08) {
        player.position.x = target.x;
        player.position.z = target.z;
        destination.current = null;
      } else {
        direction.set(dx / distance, 0, dz / distance);

        const step = Math.min(
          MOVE_SPEED * dt,
          distance
        );

        player.position.x += direction.x * step;
        player.position.z += direction.z * step;
      }
    }

    // Mantém o personagem dentro da praça.
    player.position.x = THREE.MathUtils.clamp(
      player.position.x,
      -WORLD_LIMIT,
      WORLD_LIMIT
    );

    player.position.z = THREE.MathUtils.clamp(
      player.position.z,
      -WORLD_LIMIT,
      WORLD_LIMIT
    );

    const isMoving = direction.lengthSq() > 0;

    moving.current = isMoving;

    // Rotação gradual na direção do movimento.
    if (isMoving) {
      const targetRotation = Math.atan2(
        direction.x,
        direction.z
      );

      let difference =
        targetRotation - player.rotation.y;

      difference = Math.atan2(
        Math.sin(difference),
        Math.cos(difference)
      );

      player.rotation.y += difference * Math.min(1, dt * 10);
    }

    // Idle e caminhada.
    const walkCycle = clock.current * 9;

    const bob = isMoving
      ? Math.abs(Math.sin(walkCycle)) * 0.055
      : Math.sin(clock.current * 2) * 0.018;

    player.position.y = START_POSITION.y + bob;

    // Anima os membros caso o GLB tenha ossos compatíveis.
    animatedBones.forEach((item) => {
      const amplitude = isMoving
        ? item.type === "arm" ? 0.35 : 0.48
        : 0.025;

      const phase =
        item.type === "arm"
          ? item.side * Math.PI
          : 0;

      const swing = isMoving
        ? Math.sin(walkCycle + phase) * amplitude
        : Math.sin(clock.current * 2 + phase) * amplitude;

      item.bone.rotation.x =
        item.initialRotation.x + swing;
    });
  });

  return (
    <group
      ref={group}
      position={[
        START_POSITION.x,
        START_POSITION.y,
        START_POSITION.z,
      ]}
    >
      <primitive object={avatar} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
