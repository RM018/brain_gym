import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Custom Shader for the "X-Ray" Glowing Edge effect
const FresnelShader = {
  uniforms: {
    mRefractionFactor: { value: 1.0 },
    mFresnelBias: { value: 0.1 },
    mFresnelPower: { value: 2.0 },
    mFresnelScale: { value: 1.0 },
    tCube: { value: null },
  },
  vertexShader: `
    varying vec3 vReflectionFactor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
      vec3 i = normalize(vPosition);
      float refractionFactor = 0.1 + 1.5 * pow(1.0 + dot(i, vNormal), 2.0);
      vReflectionFactor = vec3(refractionFactor);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.3);
    }
  `,
  fragmentShader: `
    varying vec3 vReflectionFactor;
    void main() {
      // Light blue / Cyan color (matching your image)
      vec3 glowColor = vec3(0.0, 0.8, 1.0); 
      gl_FragColor = vec4(glowColor * vReflectionFactor, 1.0);
    }
  `
};

const BrainModel = ({ scale = 2.5 }: { scale?: number }) => {
  // Model path loading
  const { scene } = useGLTF('/models/brain_areas.glb'); 
  const brainRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    brainRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  // Apply shader to all parts of the brain
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.ShaderMaterial({
          uniforms: THREE.UniformsUtils.clone(FresnelShader.uniforms),
          vertexShader: FresnelShader.vertexShader,
          fragmentShader: FresnelShader.fragmentShader,
          transparent: true,
          blending: THREE.AdditiveBlending,
        });
      }
    });
  }, [scene]);

  return <primitive object={scene} ref={brainRef} scale={scale} />;
};

export default function BrainShowpiece() {
  const [modelScale, setModelScale] = useState<number>(2.5);
  const [cameraZ, setCameraZ] = useState<number>(6);

  useEffect(() => {
    function updateSizes() {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
      if (w <= 480) {
        setModelScale(1.2);
        setCameraZ(8);
      } else if (w <= 768) {
        setModelScale(1.8);
        setCameraZ(7);
      } else if (w <= 1024) {
        setModelScale(2.2);
        setCameraZ(6.5);
      } else {
        setModelScale(2.5);
        setCameraZ(6);
      }
    }
    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas style={{ width: '100%', height: '100%' }} dpr={[1, 2]} camera={{ position: [0, 0, cameraZ], fov: 45 }}>
        <Suspense fallback={null}>
        
        
        {/* Background Stars like the image */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.1} />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <BrainModel scale={modelScale} />
        </Float>

          {/* Post-processing is key for the neon glow */}
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0} 
              mipmapBlur 
              intensity={0.1} 
              radius={0.3} 
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}