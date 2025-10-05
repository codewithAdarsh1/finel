'use client';
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef, useEffect, useState } from "react";
import Earth from "./Earth";
import {
  Float,
  PerspectiveCamera,
} from "@react-three/drei";
import type { Group, PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import Satellite from "./Satellite";
import Particles from "./Particles";
import gsap from "gsap";
import CoolText from "./CoolText";

const RotatingEarth = () => {
  const earthRef = useRef<Group>(null!);
  const baseSpeed = 0.03; 
  const scrollSpeed = 0.19; 
  const [targetSpeed, setTargetSpeed] = useState(baseSpeed);
  const currentSpeed = useRef(baseSpeed);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
  
    const handleWheel = () => {
      setTargetSpeed(scrollSpeed);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setTargetSpeed(baseSpeed), 120);
    };
  
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  useFrame((_, delta) => {
    currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.1;
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * currentSpeed.current;
    }
  });

  return (
    <group ref={earthRef} scale={0.11} position={[8, -11, -3]}>
      <Earth />
    </group>
  );
};

const Scene = ({ story }: { story: boolean }) => {
  const satelliteGroup = useRef<Group>(null!);
  const cameraRef = useRef<ThreePerspectiveCamera>(null!);
  const tiltRef = useRef<Group>(null!);

  useFrame(({ pointer }, delta) => {
    if (!tiltRef.current) return;
    const targetX = pointer.x * 0.3;
    const targetY = -pointer.y * 0.3;
    const r = tiltRef.current.rotation;
    const k = 6; 
    r.x += (targetY - r.x) * k * delta;
    r.y += (targetX - r.y) * k * delta;
  });

  useEffect(() => {
    if (!satelliteGroup.current || !cameraRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', overwrite: 'auto' } });

    tl.to(satelliteGroup.current.position, {
        x: story ? -2 : -1,
        y: story ? -1 : 0,
        z: -2,
        duration: 1.2,
      }, 0)
      .to(satelliteGroup.current.scale, {
        x: story ? 0.35 : 0.6,
        y: story ? 0.35 : 0.6,
        z: story ? 0.35 : 0.6,
        duration: 1.2,
      }, 0)
      .to(satelliteGroup.current.rotation, {
        x: story ? Math.PI / 2 : 0,
        y: story ? Math.PI / 1.7 : Math.PI / 2,
        z: story ? -Math.PI / 2 : 0.2,
        duration: 1.2,
      }, 0)
      .to(cameraRef.current.position, {
        x: story ? -8 : 0,
        y: story ? -1 : 0,
        z: story ? -2 : 10,
        duration: 1.5,
      }, 0);

    return () => {
      tl.kill();
    }
  }, [story]);

  return (
    <Canvas>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={1} />
      <Float>
        <group
          ref={satelliteGroup}
          position={[-1, -1, -2]}
          scale={0.6}
          rotation={[0, Math.PI / 2, 0.2]}
        >
          <Satellite />
        </group>
      </Float>
      <Float speed={0.2} rotationIntensity={0.2} floatIntensity={1}>
        <group position={[-25, -5, -10]} scale={8} rotation={[0, 0, 1]}>
          <Particles />
        </group>
      </Float>
      <group scale={1.5} position={[0, 0, -40]} ref={tiltRef}>
        <CoolText />
        <directionalLight position={[0.5, 5, 0]} intensity={0.5} color="red" />
        <directionalLight position={[0, -5, 0]} intensity={0.5} color="blue" />
      </group>
      <RotatingEarth />
    </Canvas>
  );
};

export default Scene;
