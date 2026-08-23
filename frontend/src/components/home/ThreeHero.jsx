import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';

function MountainTerrain() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={meshRef}>
      {/* 3D Mountain Mesh Geometry */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 3, 0, 0]}>
        <planeGeometry args={[12, 12, 32, 32]} />
        <meshStandardMaterial 
          color="#0071e3" 
          wireframe 
          emissive="#005bb5" 
          emissiveIntensity={0.2} 
        />
      </mesh>

      {/* Floating 3D Temple Motif Ring */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, 1, 0]}>
          <torusGeometry args={[1.8, 0.08, 16, 100]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>
    </group>
  );
}

export default function ThreeHero() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.65 }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <Sparkles count={80} scale={10} size={3} speed={0.4} color="#0071e3" />
        <MountainTerrain />
      </Canvas>
    </div>
  );
}
