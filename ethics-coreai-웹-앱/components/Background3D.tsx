import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

// Fix for "Property '...' does not exist on type 'JSX.IntrinsicElements'"
// We explicitly define the Three.js elements used in this file to satisfy TypeScript.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      gridHelper: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      instancedMesh: any;
      octahedronGeometry: any;
      meshStandardMaterial: any;
      pointLight: any;
      ambientLight: any;
      spotLight: any;
      fog: any;
      icosahedronGeometry: any;
      dodecahedronGeometry: any;
      torusGeometry: any;
    }
  }
}

/**
 * =================================================================
 * COMPONENT: THE CYBER GRID FLOOR
 * Gives the scene a sense of immense scale and ground connection.
 * =================================================================
 */
const CyberGrid = () => {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (!gridRef.current) return;
    // Move grid endlessly towards camera to simulate speed/progress
    const t = state.clock.getElapsedTime();
    gridRef.current.position.z = (t * 2) % 10; 
  });

  return (
    <group position={[0, -15, 0]} rotation={[0, 0, 0]}>
      <gridHelper 
        ref={gridRef} 
        args={[200, 100, 0x1e293b, 0x0f172a]} // Large scale, dark cyber colors
      />
      {/* Fog to hide the grid edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#020205" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

/**
 * =================================================================
 * COMPONENT: THE CONVERGENCE SWARM
 * Left: AI (Cubes, Blue, Structured)
 * Right: Human (Spheres, Pink/Gold, Organic)
 * =================================================================
 */
const ConvergenceSwarm = () => {
  const count = 4000; // High particle count for grandeur
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { mouse, viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize Particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Determine side: Left (AI) or Right (Human)
      // We map 0..count to a range that concentrates on two sides
      const isAI = i < count / 2;
      
      const speed = 0.2 + Math.random() * 0.8;
      const size = Math.random() * 0.4 + 0.1;
      
      // Initial positions: Create two "clouds" or "heads" facing each other
      // AI Center: x = -15, Human Center: x = 15
      const centerX = isAI ? -15 : 15;
      
      // Random spread around the center to form a blob/head shape
      const radius = 10 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = centerX + radius * Math.sin(phi) * Math.cos(theta) * 0.8; // Flatten slightly
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) * 0.5; // Flatten depth

      temp.push({ 
        isAI, speed, size, 
        x, y, z, 
        initialX: x, initialY: y, initialZ: z,
        phase: Math.random() * 100 
      });
    }
    return temp;
  }, [count]);

  const colorAI = new THREE.Color("#00f3ff"); // Neon Cyan
  const colorAI_Dark = new THREE.Color("#2563eb"); // Deep Blue
  const colorHuman = new THREE.Color("#ff0080"); // Neon Magenta
  const colorHuman_Gold = new THREE.Color("#fbbf24"); // Warm Gold

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Parallax effect based on mouse
    const mouseX = (mouse.x * viewport.width) / 50;
    const mouseY = (mouse.y * viewport.height) / 50;

    particles.forEach((p, i) => {
      let { isAI, speed, size, initialX, initialY, initialZ, phase } = p;
      const t = time * speed + phase;

      if (isAI) {
        // --- AI MOVEMENT: DIGITAL / CIRCUIT / GLITCH ---
        // Stiff, grid-like movements, occasional rapid shifts
        
        // Base hover
        let currX = initialX + Math.sin(t * 0.5) * 0.5;
        let currY = initialY + Math.cos(t * 0.3) * 0.5;
        let currZ = initialZ;

        // "Data Stream" effect: Particles flow towards center then reset
        const flow = (t * 5) % 20;
        if (i % 10 === 0) {
           currX += flow; 
           if (currX > 0) currX = initialX; // Reset if crosses center
        }

        // Mouse reaction: AI moves away slightly (calculating)
        currX -= mouseX * 2;
        currY -= mouseY * 2;

        dummy.position.set(currX, currY, currZ);
        
        // AI Rotation: Mechanical 90 degree turns
        dummy.rotation.set(
            Math.floor(t) * (Math.PI / 2), 
            Math.floor(t * 0.5) * (Math.PI / 2), 
            0
        );
        
        // AI Shape: Cube-like scale
        const scalePulse = size * (1 + Math.sin(t * 10) * 0.2); // Rapid pulse
        dummy.scale.setScalar(scalePulse);

        // Color mixing
        meshRef.current!.setColorAt(i, i % 3 === 0 ? colorAI_Dark : colorAI);

      } else {
        // --- HUMAN MOVEMENT: ORGANIC / NEURAL / FLOW ---
        // Smooth, curved, breathing movements
        
        // Organic swirl
        let currX = initialX + Math.sin(t * 0.5) * 2;
        let currY = initialY + Math.cos(t * 0.4) * 2;
        let currZ = initialZ + Math.sin(t * 0.3) * 2;

        // "Connection" effect: Reaching out to center
        if (i % 20 === 0) {
            currX -= Math.sin(t) * 3; // Reach towards AI
        }

        // Mouse reaction: Human moves towards (curiosity)
        currX += mouseX * 2;
        currY += mouseY * 2;

        dummy.position.set(currX, currY, currZ);
        
        // Human Rotation: Smooth tumbling
        dummy.rotation.set(t * 0.2, t * 0.1, t * 0.05);

        // Human Shape: Breathing scale
        const scaleBreath = size * (1 + Math.sin(t * 2) * 0.3);
        dummy.scale.setScalar(scaleBreath);

        // Color mixing
        meshRef.current!.setColorAt(i, i % 5 === 0 ? colorHuman_Gold : colorHuman);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* 
        Using Octahedron is a good balance. 
        It looks like a diamond/crystal for AI, but round enough for Human when spinning.
      */}
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial 
        toneMapped={false}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

/**
 * =================================================================
 * COMPONENT: THE CENTRAL CORE (The Connection Point)
 * A visually distinct structure representing the "Ethical Standard"
 * =================================================================
 */
const CentralCore = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if(!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.5;
    ref.current.rotation.z = Math.sin(t * 0.2) * 0.2;
  });

  return (
    <group ref={ref}>
      {/* The Central Light Source */}
      <pointLight intensity={10} color="#ffffff" distance={50} decay={2} />
      
      <Float speed={5} rotationIntensity={1} floatIntensity={1}>
        {/* Wireframe Globe */}
        <mesh>
          <icosahedronGeometry args={[2, 2]} />
          <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
        </mesh>
        
        {/* Inner Energy Core */}
        <mesh>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
        </mesh>

        {/* Orbiting Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
           <torusGeometry args={[3, 0.02, 16, 100]} />
           <meshBasicMaterial color="#00f3ff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
           <torusGeometry args={[3.5, 0.02, 16, 100]} />
           <meshBasicMaterial color="#ff0080" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  );
};

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-[#020205]">
      {/* 
         High Performance Mode 
         Antialias off for sharpness + performance with many particles 
      */}
      <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 0, 50]} fov={60} />
        
        {/* ================= LIGHTING ================= */}
        <ambientLight intensity={0.1} />
        
        {/* AI Side Light (Cool Blue - Strong Rim Light) */}
        <spotLight position={[-40, 10, 10]} angle={0.5} penumbra={1} intensity={20} color="#00f3ff" distance={100} />
        
        {/* Human Side Light (Warm Magenta - Strong Rim Light) */}
        <spotLight position={[40, 10, 10]} angle={0.5} penumbra={1} intensity={20} color="#ff0080" distance={100} />

        {/* Scene Environment */}
        <fog attach="fog" args={['#020205', 20, 100]} />
        <Stars radius={150} depth={50} count={6000} factor={4} saturation={1} fade speed={1} />
        
        {/* ================= CONTENT ================= */}
        <group>
          <CentralCore />
          <ConvergenceSwarm />
          <CyberGrid />
        </group>

      </Canvas>
      
      {/* ================= POST-PROCESSING FAKES (OVERLAYS) ================= */}
      {/* 1. Vignette to focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020205_100%)] pointer-events-none opacity-80" />
      
      {/* 2. Cyber Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_3px,rgba(0,0,0,0.3)_1px)] bg-[size:100%_4px] pointer-events-none opacity-30" />
      
      {/* 3. Subtle Color Grading (Left Blue / Right Pink) */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-pink-900/20 pointer-events-none mix-blend-screen" />
    </div>
  );
};

export default Background3D;