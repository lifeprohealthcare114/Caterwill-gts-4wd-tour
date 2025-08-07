import React from 'react';
import { Html } from '@react-three/drei';
import './ThreeDViewer.css';

const HotspotMarker = ({ part, onClick, isHovered, onHover }) => {
  const position = [
    part.position.x/50-1,
    part.position.y/50-1,
    0
  ];

  return (
    <group position={position}>
      <mesh
        onClick={() => onClick(part)}
        onPointerOver={() => onHover(part.id)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color={isHovered ? "#ef4444" : "#f59e0b"} 
          emissive={isHovered ? "#ef4444" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>
      {isHovered && (
        <Html center>
          <div className="hotspot-tooltip">
            {part.name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default HotspotMarker;