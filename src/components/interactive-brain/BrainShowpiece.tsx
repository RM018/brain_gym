import React, { useRef, useMemo } from 'react';
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

const BrainModel = () => {
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

  return <primitive object={scene} ref={brainRef} scale={2.5} />;
};

export default function BrainShowpiece() {
  return (
    <div style={{ width: '100vw', height: '100vh'}}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        
        
        {/* Background Stars like the image */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.1} />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <BrainModel />
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
      </Canvas>
    </div>
  );
}