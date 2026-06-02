import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Sphere, PerspectiveCamera } from "@react-three/drei";
import { useRef, Suspense } from "react";

const AnimatedSphere = () => {
  const mesh = useRef();

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.cos(t / 4) / 8;
    mesh.current.rotation.y = Math.sin(t / 4) / 8;
    mesh.current.rotation.z = Math.sin(t / 4) / 10;
    mesh.current.position.y = Math.sin(t / 2) * 0.4;
  });

  return (
    <Sphere ref={mesh} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0}
        metalness={0.5}
      />
    </Sphere>
  );
};

const QueueToken3D = () => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      opacity: 0.35,
    }}>
      <Suspense fallback={null}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <AnimatedSphere />
          </Float>
        </Canvas>
      </Suspense>
    </div>
  );
};

export default QueueToken3D;
