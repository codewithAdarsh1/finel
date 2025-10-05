import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Particles() {
  const mesh = useRef<THREE.Points>(null!);

  const count = 2000;

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      temp[i] = (Math.random() - 0.5) * 20;
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    mesh.current.rotation.y += delta * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="white" />
    </points>
  );
}
