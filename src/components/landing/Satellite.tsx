import React from "react";

export default function Satellite() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.2, 0.2]} />
      <meshStandardMaterial color="gray" />
      <mesh position={[-0.3, 0, 0]}>
         <boxGeometry args={[0.1, 0.8, 0.1]} />
         <meshStandardMaterial color="lightblue" />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
         <boxGeometry args={[0.1, 0.8, 0.1]} />
         <meshStandardMaterial color="lightblue" />
      </mesh>
    </mesh>
  );
}
