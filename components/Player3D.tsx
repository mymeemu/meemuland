
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import AvatarBase from "./avatar/AvatarBase";

const START_POSITION = new THREE.Vector3(0, 0, 3);
const WORLD_LIMIT = 9.5;
const MOVE_SPEED = 2.7;
const ARRIVAL_DISTANCE = 0.07;

export default function Player3D() {
  const group = useRef<THREE.Group>(null);
  const destination = useRef<THREE.Vector3 | null>(null);
  const wasMoving = useRef(false);

  const [isMoving, setIsMoving] = useState(false);

  const { camera, gl } = useThree();

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

      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(pointer, camera);

      if (!raycaster.ray.intersectPlane(ground, hit)) {
        return;
      }

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
    };

    gl.domElement.addEventListener(
      "pointerdown",
      onPointerDown
    );

    return () => {
      gl.domElement.removeEventListener(
        "pointerdown",
        onPointerDown
      );
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const player = group.current;

    if (!player) return;

    const dt = Math.min(delta, 0.05);
    const target = destination.current;

    let movingNow = false;

    if (target) {
      const dx = target.x - player.position.x;
      const dz = target.z - player.position.z;

      const distance = Math.hypot(dx, dz);

      if (distance <= ARRIVAL_DISTANCE) {
        player.position.x = target.x;
        player.position.z = target.z;

        destination.current = null;
      } else {
        const directionX = dx / distance;
        const directionZ = dz / distance;

        const step = Math.min(
          MOVE_SPEED * dt,
          distance
        );

        player.position.x += directionX * step;
        player.position.z += directionZ * step;

        const targetRotation = Math.atan2(
          directionX,
          directionZ
        );

        let angle = targetRotation - player.rotation.y;

        angle = Math.atan2(
          Math.sin(angle),
          Math.cos(angle)
        );

        player.rotation.y += angle * Math.min(1, dt * 10);

        movingNow = true;
      }
    }

    if (movingNow !== wasMoving.current) {
      wasMoving.current = movingNow;
      setIsMoving(movingNow);
    }

    const time = performance.now() / 1000;

    const bob = movingNow
      ? Math.abs(Math.sin(time * 9)) * 0.025
      : Math.sin(time * 2) * 0.008;

    player.position.y = bob;
  });

  return (
    <group
      ref={group}
      position={[
        START_POSITION.x,
        0,
        START_POSITION.z
      ]}
    >
      <AvatarBase moving={isMoving} />
    </group>
  );
}
