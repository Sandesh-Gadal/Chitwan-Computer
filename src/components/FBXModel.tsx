// src/components/FBXModel.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { useLoader } from '@react-three/fiber';

const FBXModel: React.FC<{ url: string }> = ({ url }) => {
  const model = useLoader(FBXLoader, url,
    (loader) => console.log('Loading progress:', loader),
    (error) => console.error('FBX load error:', error)
  );

  const ref = useRef<any>();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003; // Slow rotation
    }
  });

  return <primitive ref={ref} object={model} scale={0.02} position={[0, -1, 0]} />;
};

export default FBXModel;
