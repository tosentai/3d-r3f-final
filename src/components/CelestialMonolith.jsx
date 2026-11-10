import React, { useRef, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Внутрішній завантажувач складної 3D моделі (GLTF)
 */
function RelicModel({ scale = 1.25 }) {
  const { scene } = useGLTF('/models/celestial-relic.glb')

  const clonedScene = React.useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          // Античний бронзово-золотий PBR матеріал
          child.material.color = new THREE.Color('#d4af37')
          child.material.metalness = 0.85
          child.material.roughness = 0.28
          child.material.needsUpdate = true
        }
      }
    })
    return clone
  }, [scene])

  // Масштабуємо бюст стародавнього Оракула для розміщення на вівтарі
  return (
    <primitive
      object={clonedScene}
      scale={[scale * 1.5, scale * 1.5, scale * 1.5]}
      position={[0, -0.2, 0]}
    />
  )
}

/**
 * Плейсхолдер кристала (відображається миттєво, доки підвантажується модель)
 */
function CrystalPlaceholder() {
  return (
    <mesh castShadow receiveShadow>
      <octahedronGeometry args={[0.75, 0]} />
      <meshPhysicalMaterial
        color="#38bdf8"
        emissive="#0284c7"
        emissiveIntensity={1.2}
        transmission={0.85}
        roughness={0.1}
        ior={1.5}
      />
    </mesh>
  )
}

/**
 * CelestialMonolith Component
 */
export function CelestialMonolith({ position = [0, 1.6, 0], scale = 1.25 }) {
  const groupRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const relicRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const rotSpeed = hovered ? 1.5 : 0.4

    // Левітація
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15
    }

    // Обертання артефакту
    if (relicRef.current) {
      relicRef.current.rotation.y += delta * rotSpeed
    }

    // Обертання золотих орбітальних кілець
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.7
      ring1Ref.current.rotation.y = t * 0.5
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.4
      ring2Ref.current.rotation.z = t * 0.6
    }
  })

  return (
    <group position={position}>
      {/* ================= П'ЄДЕСТАЛ ВІВТАРЯ ================= */}
      <group position={[0, -0.6, 0]}>
        <mesh castShadow receiveShadow position={[0, -0.4, 0]}>
          <cylinderGeometry args={[1.8, 2.1, 0.4, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh receiveShadow position={[0, -0.18, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.08, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.25}
            metalness={0.8}
            emissive="#d97706"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* ================= ЛЕВІТУЮЧИЙ БЛОК ================= */}
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <pointLight
          color={hovered ? '#67e8f9' : '#38bdf8'}
          intensity={hovered ? 2.5 : 1.6}
          distance={6}
          decay={2}
        />

        {/* 1. Складна модель із прогресивним неблокуючим завантаженням */}
        <group ref={relicRef} position={[0, 0, 0]}>
          <Suspense fallback={<CrystalPlaceholder />}>
            <RelicModel scale={scale} />
          </Suspense>
        </group>

        {/* 2. Орбітальне кільце 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.7, 0.03, 12, 36]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.2}
            metalness={0.9}
            emissive="#b45309"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* 3. Орбітальне кільце 2 */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.0, 0.025, 12, 36]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.15}
            metalness={0.85}
            emissive="#0284c7"
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>
    </group>
  )
}

// Прелоад легкої 462KB моделі
useGLTF.preload('/models/celestial-relic.glb')
