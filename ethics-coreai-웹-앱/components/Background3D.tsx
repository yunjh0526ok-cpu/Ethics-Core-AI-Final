
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * =================================================================
 * COMPONENT: AUGMENTED CHESSBOARD GRID (AI Layout)
 * A sophisticated, dual-layered grid system that creates a sense of
 * vast digital space without visual noise.
 * =================================================================
 */
const AugmentedGrid = () => {
  const floorRef = useRef<THREE.Group>(null);
  const ceilingRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Smooth, slow movement for infinite scrolling effect
    if (floorRef.current) {
      floorRef.current.position.z = (t * 0.5) % 2;
    }
    if (ceilingRef.current) {
      ceilingRef.current.position.z = (t * 0.5) % 2;
    }
  });

  // Grid Colors
  const mainColor = 0x06b6d4; // Cyan Accent
  const subColor = 0x1e293b;  // Dark Slate
  const floorSize = 100;

  return (
    <group>
      {/* === FLOOR GRID === */}
      <group ref={floorRef} position={[0, -2.5, 0]}>
        {/* Primary Large Grid (The Chessboard Structure) */}
        <gridHelper 
          args={[floorSize, 20, mainColor, subColor]} 
          position={[0, 0, 0]}
        />
        {/* Secondary Fine Grid (High-tech Detail) */}
        <gridHelper 
          args={[floorSize, 80, subColor, 0x0f172a]} 
          position={[0, 0.01, 0]}
          material-opacity={0.3}
          material-transparent={true}
        />
        {/* Reflective Plane Mockup (Subtle glow from below) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[floorSize, floorSize]} />
          <meshBasicMaterial color="#020205" opacity={0.95} transparent />
        </mesh>
      </group>

      {/* === CEILING GRID (Optional depth cue) === */}
      <group ref={ceilingRef} position={[0, 10, 0]}>
        <gridHelper 
          args={[floorSize, 10, 0x1e293b, 0x000000]} 
          position={[0, 0, 0]}
          material-opacity={0.1}
          material-transparent={true}
        />
      </group>
    </group>
  );
};

/**
 * =================================================================
 * COMPONENT: CUTE ROBOT (ECO)
 * Maintained exactly as requested: Zoom In/Out animation, 3D look.
 * =================================================================
 */
interface CuteRobotProps {
  view?: string;
}

const CuteRobot: React.FC<CuteRobotProps> = ({ view }) => {
  const groupRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  // FIXED: Robot stays at center (0) regardless of view
  const targetX = 0; 

  // Responsive Scale
  const isMobile = viewport.width < 7; 
  const scale = isMobile ? 0.65 : 1; 

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (groupRef.current) {
        // Force position to 0 (Center Fixed)
        groupRef.current.position.x = 0;

        // Subtle Body Rotation (Looking around)
        const baseRotation = 0;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y, 
            baseRotation + Math.sin(t * 0.5) * 0.1, 
            0.1
        );
        groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
        
        // Gentle Floating/Breathing Scale (Zoom In/Out effect)
        const breathe = 1 + Math.sin(t * 1.5) * 0.02;
        const targetScale = scale * breathe;
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1));
    }

    // Eye Blinking Animation
    if (eyesRef.current) {
        const blinkCycle = Math.sin(t * 2.5);
        const isBlinking = blinkCycle > 0.98; 
        const targetScaleY = isBlinking ? 0.1 : 1;
        eyesRef.current.scale.y = THREE.MathUtils.lerp(eyesRef.current.scale.y, targetScaleY, 0.4);
    }
  });

  return (
    <group ref={groupRef} position={[4, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
        
        {/* === HEAD GROUP === */}
        <group position={[0, 0.5, 0]}>
          {/* Main Shell */}
          <mesh>
            <sphereGeometry args={[1.3, 64, 64]} />
            <meshPhysicalMaterial 
              color="#ffffff" 
              roughness={0.2} 
              metalness={0.1} 
              clearcoat={0.8}
            />
          </mesh>

          {/* Visor Area */}
          <mesh position={[0, 0, 0.35]}>
            <sphereGeometry args={[1.05, 64, 64]} /> 
            <meshStandardMaterial color="#111111" roughness={0.1} metalness={0.8} />
          </mesh>

          {/* Eyes Group */}
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
            {/* Holographic Ring */}
            <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.2, 0]}>
              <torusGeometry args={[0.3, 0.01, 16, 32]} />
              <meshBasicMaterial color="#ff0080" transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Ear Cups */}
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
           
           {/* Chest Core */}
           <mesh position={[0, 0.1, 0.65]} rotation={[0.2, 0, 0]}>
             <circleGeometry args={[0.2, 32]} />
             <meshBasicMaterial color="#ff0080" toneMapped={false} />
           </mesh>
           <pointLight position={[0, 0.1, 0.8]} color="#ff0080" distance={2} intensity={2} />
        </group>

        {/* === HANDS === */}
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

interface Background3DProps {
    view?: string;
}

const Background3D: React.FC<Background3DProps> = ({ view }) => {
  return (
    <div className="fixed inset-0 z-0 bg-[#020205]">
      {/* 
         High Performance Mode 
      */}
      <Canvas dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={50} />
        
        {/* ================= LIGHTING ================= */}
        {/* Ambient light for visibility */}
        <ambientLight intensity={0.7} /> 
        
        {/* Key Light (Cyan - from grid) */}
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={30} color="#00f3ff" distance={50} />
        
        {/* Fill Light (Magenta - Contrast) */}
        <spotLight position={[-10, 5, 10]} angle={0.5} penumbra={1} intensity={20} color="#ff0080" distance={50} />
        
        {/* Rim Light (White - Outline) */}
        <spotLight position={[0, 10, -5]} intensity={40} color="#ffffff" />

        {/* Scene Environment */}
        <fog attach="fog" args={['#020205', 10, 60]} />
        
        {/* ================= CONTENT ================= */}
        <group position={[0, -1, 0]}>
          <CuteRobot view={view} />
          <AugmentedGrid />
        </group>

      </Canvas>
      
      {/* ================= POST-PROCESSING (Clean & Tech) ================= */}
      {/* 1. Vignette for focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020205_100%)] pointer-events-none opacity-80" />
      
      {/* 2. Very subtle Scanlines for 'Screen' feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_3px,rgba(0,0,0,0.15)_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
    </div>
  );
};

export default Background3D;
