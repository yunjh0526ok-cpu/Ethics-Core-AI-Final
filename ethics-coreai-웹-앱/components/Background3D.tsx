
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

// Define the Three.js elements for JSX
type ThreeElementProps = any;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: ThreeElementProps;
      pointLight: ThreeElementProps;
      spotLight: ThreeElementProps;
      group: ThreeElementProps;
      mesh: ThreeElementProps;
      instancedMesh: ThreeElementProps;
      gridHelper: ThreeElementProps;
      planeGeometry: ThreeElementProps;
      octahedronGeometry: ThreeElementProps;
      icosahedronGeometry: ThreeElementProps;
      dodecahedronGeometry: ThreeElementProps;
      torusGeometry: ThreeElementProps;
      sphereGeometry: ThreeElementProps;
      cylinderGeometry: ThreeElementProps;
      capsuleGeometry: ThreeElementProps;
      circleGeometry: ThreeElementProps;
      meshBasicMaterial: ThreeElementProps;
      meshStandardMaterial: ThreeElementProps;
      meshPhysicalMaterial: ThreeElementProps;
      fog: ThreeElementProps;
    }
  }
}

// Ensure React.JSX is also augmented for newer React versions
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: ThreeElementProps;
      pointLight: ThreeElementProps;
      spotLight: ThreeElementProps;
      group: ThreeElementProps;
      mesh: ThreeElementProps;
      instancedMesh: ThreeElementProps;
      gridHelper: ThreeElementProps;
      planeGeometry: ThreeElementProps;
      octahedronGeometry: ThreeElementProps;
      icosahedronGeometry: ThreeElementProps;
      dodecahedronGeometry: ThreeElementProps;
      torusGeometry: ThreeElementProps;
      sphereGeometry: ThreeElementProps;
      cylinderGeometry: ThreeElementProps;
      capsuleGeometry: ThreeElementProps;
      circleGeometry: ThreeElementProps;
      meshBasicMaterial: ThreeElementProps;
      meshStandardMaterial: ThreeElementProps;
      meshPhysicalMaterial: ThreeElementProps;
      fog: ThreeElementProps;
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
  const count = 3000; // Slightly reduced count for performance
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
      // AI Center: x = -20, Human Center: x = 20
      const centerX = isAI ? -20 : 20;
      
      // Random spread around the center to form a blob/head shape
      const radius = 12 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) * 0.5 - 5; // Push back slightly

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
        // --- AI MOVEMENT ---
        let currX = initialX + Math.sin(t * 0.5) * 0.5;
        let currY = initialY + Math.cos(t * 0.3) * 0.5;
        let currZ = initialZ;

        // Mouse reaction
        currX -= mouseX * 2;
        currY -= mouseY * 2;

        dummy.position.set(currX, currY, currZ);
        dummy.rotation.set(Math.floor(t) * (Math.PI / 2), Math.floor(t * 0.5) * (Math.PI / 2), 0);
        
        const scalePulse = size * (1 + Math.sin(t * 5) * 0.2); 
        dummy.scale.setScalar(scalePulse);
        meshRef.current!.setColorAt(i, i % 3 === 0 ? colorAI_Dark : colorAI);

      } else {
        // --- HUMAN MOVEMENT ---
        let currX = initialX + Math.sin(t * 0.5) * 2;
        let currY = initialY + Math.cos(t * 0.4) * 2;
        let currZ = initialZ;

        // Mouse reaction
        currX += mouseX * 2;
        currY += mouseY * 2;

        dummy.position.set(currX, currY, currZ);
        dummy.rotation.set(t * 0.2, t * 0.1, t * 0.05);

        const scaleBreath = size * (1 + Math.sin(t * 2) * 0.3);
        dummy.scale.setScalar(scaleBreath);
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
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial 
        color="#ffffff"
        toneMapped={false}
        transparent
        opacity={0.6}
        roughness={0.5}
        metalness={0.4}
      />
    </instancedMesh>
  );
};

/**
 * =================================================================
 * COMPONENT: CUTE ROBOT (Main Hero Character)
 * Replaces the abstract globe/avatars with a friendly, high-tech robot.
 * =================================================================
 */
const CuteRobot = () => {
  const groupRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // 1. Subtle Body Rotation (Looking around)
    if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }

    // 2. Eye Blinking Animation
    if (eyesRef.current) {
        // Blink logic: Sharp close every ~3 seconds
        const blinkCycle = Math.sin(t * 2.5);
        const isBlinking = blinkCycle > 0.98; // Short blink window
        const targetScaleY = isBlinking ? 0.1 : 1;
        
        // Lerp for smooth blink transition
        eyesRef.current.scale.y = THREE.MathUtils.lerp(eyesRef.current.scale.y, targetScaleY, 0.4);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
        
        {/* === HEAD GROUP === */}
        <group position={[0, 0.5, 0]}>
          {/* Main Shell: White Glossy Sphere */}
          <mesh>
            <sphereGeometry args={[1.3, 64, 64]} />
            <meshPhysicalMaterial 
              color="#ffffff" 
              roughness={0.2} 
              metalness={0.1} 
              clearcoat={0.8}
            />
          </mesh>

          {/* Visor Area: Black Glass (Intersecting Sphere pushed forward) */}
          <mesh position={[0, 0, 0.35]}>
            <sphereGeometry args={[1.05, 64, 64]} /> 
            <meshStandardMaterial color="#111111" roughness={0.1} metalness={0.8} />
          </mesh>

          {/* Eyes Group (For Blinking) */}
          <group ref={eyesRef} position={[0, 0.1, 1.35]}>
            {/* Left Eye */}
            <mesh position={[-0.35, 0, 0]} rotation={[0, 0, -0.1]}>
              <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
              <meshBasicMaterial color="#00f3ff" toneMapped={false} />
            </mesh>
            {/* Right Eye */}
            <mesh position={[0.35, 0, 0]} rotation={[0, 0, 0.1]}>
              <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
              <meshBasicMaterial color="#00f3ff" toneMapped={false} />
            </mesh>
            {/* Eye Glow */}
            <pointLight distance={3} intensity={3} color="#00f3ff" position={[0, 0, 0.5]} />
          </group>

          {/* Antenna */}
          <group position={[0, 1.3, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.12]} />
              <meshBasicMaterial color="#ff0080" toneMapped={false} />
              <pointLight distance={5} intensity={5} color="#ff0080" />
            </mesh>
            {/* Holographic Ring around Antenna */}
            <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.2, 0]}>
              <torusGeometry args={[0.3, 0.01, 16, 32]} />
              <meshBasicMaterial color="#ff0080" transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Ear Cups / Headphones */}
          <mesh position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.2, 0.2, 0.3]} />
             <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.2, 0.2, 0.3]} />
             <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>

        {/* === BODY GROUP === */}
        <group position={[0, -1.3, 0]}>
           <mesh>
             <sphereGeometry args={[0.7, 32, 32]} />
             <meshPhysicalMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
           </mesh>
           
           {/* Chest Core (Heart) */}
           <mesh position={[0, 0.1, 0.65]} rotation={[0.2, 0, 0]}>
             <circleGeometry args={[0.2, 32]} />
             <meshBasicMaterial color="#ff0080" toneMapped={false} />
           </mesh>
           <pointLight position={[0, 0.1, 0.8]} color="#ff0080" distance={2} intensity={2} />
        </group>

        {/* === HANDS (Floating) === */}
        <group>
            <mesh position={[-1.5, -0.8, 0.5]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[1.5, -0.8, 0.5]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
        </group>

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
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={50} />
        
        {/* ================= LIGHTING ================= */}
        <ambientLight intensity={0.5} /> {/* Increased ambient for white robot visibility */}
        
        {/* Key Light (Cool Blue) */}
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={50} color="#00f3ff" distance={50} />
        
        {/* Fill Light (Warm Magenta) */}
        <spotLight position={[-10, 10, 10]} angle={0.5} penumbra={1} intensity={40} color="#ff0080" distance={50} />
        
        {/* Rim Light (White - Stronger for robot outline) */}
        <spotLight position={[0, 10, -10]} intensity={40} color="#ffffff" />

        {/* Scene Environment */}
        <fog attach="fog" args={['#020205', 10, 60]} />
        <Stars radius={150} depth={50} count={6000} factor={4} saturation={1} fade speed={1} />
        
        {/* ================= CONTENT ================= */}
        <group position={[0, -1, 0]}>
          <CuteRobot />
          <ConvergenceSwarm />
          <CyberGrid />
        </group>

      </Canvas>
      
      {/* ================= POST-PROCESSING FAKES (OVERLAYS) ================= */}
      {/* 1. Vignette to focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020205_100%)] pointer-events-none opacity-80" />
      
      {/* 2. Cyber Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_3px,rgba(0,0,0,0.3)_1px)] bg-[size:100%_4px] pointer-events-none opacity-30" />
      
      {/* 3. Subtle Color Grading */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-transparent to-cyan-900/20 pointer-events-none mix-blend-screen" />
    </div>
  );
};

export default Background3D;
