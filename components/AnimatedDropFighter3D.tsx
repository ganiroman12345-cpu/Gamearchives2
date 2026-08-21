import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Fighter3D } from './Fighter3D';
import { ActionType } from '../types';
import { playGroundThud } from '../utils/audio';
import * as THREE from 'three';

interface AnimatedDropFighter3DProps {
  who: 'player' | 'enemy' | 'preview';
  previewState?: any;
  delay?: number;
  flipDirection?: number; // 1 or -1 for spin direction
}

export const AnimatedDropFighter3D: React.FC<AnimatedDropFighter3DProps> = ({
  who,
  previewState,
  delay = 0,
  flipDirection = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number>(0);
  const thudPlayedRef = useRef<boolean>(false);
  const thud2PlayedRef = useRef<boolean>(false);

  useEffect(() => {
    startTimeRef.current = performance.now();
    thudPlayedRef.current = false;
    thud2PlayedRef.current = false;
  }, [who]);

  useFrame(() => {
    if (!groupRef.current) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000 - delay;

    if (elapsed < 0) {
      // In the air waiting to drop
      groupRef.current.position.set(0, 7.0, 0);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(1, 1, 1);
      return;
    }

    const t = elapsed;

    if (t < 0.65) {
      // Phase 1: High speed free-fall with dynamic aerial flips & somersaults
      const progress = t / 0.65;
      const easeFall = progress * progress; // Quadratic acceleration downward
      const currentY = THREE.MathUtils.lerp(6.0, 0.0, easeFall);

      // Rapid full 360-degree aerial spins
      const spinAngle = progress * Math.PI * 4 * flipDirection;
      const tiltAngle = Math.sin(progress * Math.PI * 2) * 0.4 * flipDirection;

      groupRef.current.position.set(0, currentY - 0.7, 0);
      groupRef.current.rotation.x = spinAngle;
      groupRef.current.rotation.z = tiltAngle;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(0, flipDirection === 1 ? -0.15 : 0.15, progress);
      groupRef.current.scale.set(0.9, 1.15, 0.9); // Stretched while falling fast
    } else if (t < 1.0) {
      // Phase 2: First ground impact & big elastic bounce
      if (!thudPlayedRef.current) {
        thudPlayedRef.current = true;
        try { playGroundThud(0.6); } catch (e) {}
      }

      const bounceProgress = (t - 0.65) / 0.35;
      const bounceHeight = Math.sin(bounceProgress * Math.PI) * 0.9;
      
      // Smoothly untwist rotation back to upright
      const rotProgress = Math.min(1, bounceProgress * 1.5);
      const currentRotX = THREE.MathUtils.lerp(0, 0, rotProgress);
      const currentRotZ = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.2);

      groupRef.current.position.set(0, bounceHeight - 0.7, 0);
      groupRef.current.rotation.x = currentRotX;
      groupRef.current.rotation.z = currentRotZ;
      groupRef.current.rotation.y = flipDirection === 1 ? -0.1 : 0.1;
      
      // Squash and stretch during bounce
      const squash = 1 - Math.sin(bounceProgress * Math.PI) * 0.15;
      groupRef.current.scale.set(1 / squash, squash, 1 / squash);
    } else if (t < 1.3) {
      // Phase 3: Second small bounce
      if (!thud2PlayedRef.current) {
        thud2PlayedRef.current = true;
        try { playGroundThud(0.25); } catch (e) {}
      }

      const bounceProgress = (t - 1.0) / 0.3;
      const bounceHeight = Math.sin(bounceProgress * Math.PI) * 0.25;

      groupRef.current.position.set(0, bounceHeight - 0.7, 0);
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.z = 0;
      groupRef.current.rotation.y = 0;
      groupRef.current.scale.set(1, 1, 1);
    } else if (t < 1.7) {
      // Phase 4: Stand-up transition (rising up gracefully from impact crouch)
      const standProgress = (t - 1.3) / 0.4;
      const easeStand = 1 - Math.pow(1 - standProgress, 3); // Cubic ease-out

      const crouchOffset = (1 - easeStand) * -0.12;
      groupRef.current.position.set(0, -0.7 + crouchOffset, 0);
      groupRef.current.rotation.set(0, 0, 0);
      
      // Slight chest expansion on rising
      const breatheScale = 1 + Math.sin(easeStand * Math.PI) * 0.05;
      groupRef.current.scale.set(breatheScale, breatheScale, breatheScale);
    } else {
      // Phase 5: Standing proud in fighting idle stance with subtle breathing
      const idleTime = t - 1.7;
      const breath = Math.sin(idleTime * 3) * 0.02;
      const sway = Math.cos(idleTime * 2) * 0.01;

      groupRef.current.position.set(sway, -0.7 + breath, 0);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef}>
      <Fighter3D who={who} previewState={previewState} />
    </group>
  );
};
