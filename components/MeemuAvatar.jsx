import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export function MeemuAvatar(props) {
  const group = useRef();
  
  // O Next.js vai buscar diretamente a public/stylized-cartoon-3d.glb
  const { scene } = useGLTF('/stylized-cartoon-3d.glb');

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/stylized-cartoon-3d.glb');
