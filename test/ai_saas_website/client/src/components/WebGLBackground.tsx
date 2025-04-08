import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface WebGLBackgroundProps {
  className?: string;
}

// Ocean Particles component
const OceanParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    
    // Rotate and animate particles
    particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    
    // Get the particles geometry
    const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    
    // Animate each particle
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      
      // Apply a sine wave to y position based on time and position
      const time = clock.getElapsedTime();
      const newY = y + Math.sin(time * 0.5 + x * 0.5 + z * 0.5) * 0.02;
      
      positionAttribute.setY(i, newY);
    }
    
    positionAttribute.needsUpdate = true;
  });
  
  // Create particles
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    // Position
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 10;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
    
    // Color - ocean blues
    const colorChoice = Math.random();
    if (colorChoice < 0.3) {
      // Deep blue
      colors[i3] = 0.02; // R
      colors[i3 + 1] = 0.12; // G
      colors[i3 + 2] = 0.18; // B
    } else if (colorChoice < 0.6) {
      // Medium blue
      colors[i3] = 0.04; // R
      colors[i3 + 1] = 0.23; // G
      colors[i3 + 2] = 0.35; // B
    } else if (colorChoice < 0.9) {
      // Light blue
      colors[i3] = 0; // R
      colors[i3 + 1] = 0.71; // G
      colors[i3 + 2] = 0.85; // B
    } else {
      // Accent teal
      colors[i3] = 0; // R
      colors[i3 + 1] = 0.47; // G
      colors[i3 + 2] = 0.71; // B
    }
  }
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Animated Ocean Waves
const OceanWaves = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Get the mesh geometry
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    
    // Animate each vertex
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      
      // Apply a sine wave to z position based on time and position
      const time = clock.getElapsedTime();
      const newZ = Math.sin(time * 0.5 + x * 2 + y * 2) * 0.15;
      
      positionAttribute.setZ(i, newZ);
    }
    
    positionAttribute.needsUpdate = true;
  });
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]}
    >
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial 
        color="#0077b6" 
        wireframe 
        transparent 
        opacity={0.3} 
      />
    </mesh>
  );
};

export const WebGLBackground = ({ className = '' }: WebGLBackgroundProps) => {
  return (
    <div className={`${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OceanParticles />
        <OceanWaves />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default WebGLBackground;
