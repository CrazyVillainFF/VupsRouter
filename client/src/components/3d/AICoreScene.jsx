import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Central holographic router core
function RouterCore({ hoveredNode, onHoverCore }) {
  const meshRef = useRef();
  const innerRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.6;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      innerRef.current.scale.set(pulse, pulse, pulse);
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.5;
      ringRef1.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.35;
      ringRef2.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.6) * 0.4;
    }
  });

  return (
    <group
      onPointerOver={() => onHoverCore?.(true)}
      onPointerOut={() => onHoverCore?.(false)}
    >
      {/* Outer Holographic Wireframe Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={hoveredNode ? 2.5 : 1.2}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Glowing Inner Energy Sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#8b5cf6"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Equatorial Luminous Ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[2.2, 0.025, 16, 100]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.65} />
      </mesh>

      {/* Orbiting Luminous Ring 2 */}
      <mesh ref={ringRef2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#d946ef" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

// Satellite Nodes representing connected model providers
function SatelliteNode({ position, color, label, speed, radius, angleOffset, onHover, isHovered }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime * speed + angleOffset;
      const x = Math.cos(time) * radius;
      const z = Math.sin(time) * radius;
      const y = Math.sin(time * 2) * 0.6;
      groupRef.current.position.set(x, y, z);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(label);
        }}
        onPointerOut={() => onHover?.(null)}
        scale={isHovered ? 1.4 : 1}
      >
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 3 : 1.5}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

// High-performance Particle Constellation
function ParticleConstellation({ count = 800 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#00f0ff'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#d946ef')
    ];

    for (let i = 0; i < count; i++) {
      // Distribute in a spherical cloud around core
      const radius = 3.5 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Interactive Scene Container with fallback and performance caps
export const AICoreScene = ({ reducedMotion = false }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  if (reducedMotion || !hasWebGL) {
    return (
      <div className="flex items-center justify-center w-full h-[480px] relative">
        <div
          style={{
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)',
            border: '2px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 0 60px rgba(0, 240, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
              filter: 'blur(10px)',
              opacity: 0.8
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '520px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.8]} // Capped device pixel ratio for performance
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          if (!gl) setHasWebGL(false);
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#d946ef" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <RouterCore hoveredNode={hoveredNode} />

          {/* Provider Satellite Nodes */}
          <SatelliteNode
            radius={3.2}
            speed={0.7}
            angleOffset={0}
            color="#00f0ff"
            label="FlagshipRouter"
            isHovered={hoveredNode === 'FlagshipRouter'}
            onHover={setHoveredNode}
          />
          <SatelliteNode
            radius={3.6}
            speed={0.55}
            angleOffset={Math.PI * 0.5}
            color="#a855f7"
            label="OpenRouter"
            isHovered={hoveredNode === 'OpenRouter'}
            onHover={setHoveredNode}
          />
          <SatelliteNode
            radius={3.9}
            speed={0.65}
            angleOffset={Math.PI}
            color="#38bdf8"
            label="Google AI"
            isHovered={hoveredNode === 'Google AI'}
            onHover={setHoveredNode}
          />
          <SatelliteNode
            radius={4.3}
            speed={0.45}
            angleOffset={Math.PI * 1.5}
            color="#10b981"
            label="Ollama Local"
            isHovered={hoveredNode === 'Ollama Local'}
            onHover={setHoveredNode}
          />

          <ParticleConstellation count={700} />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
        />
      </Canvas>

      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(12, 16, 27, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #00f0ff',
            padding: '8px 20px',
            borderRadius: '24px',
            color: '#00f0ff',
            fontSize: '0.88rem',
            fontWeight: 600,
            pointerEvents: 'none',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
          }}
        >
          Node: {hoveredNode} (Active Router Link)
        </div>
      )}
    </div>
  );
};

export default AICoreScene;
