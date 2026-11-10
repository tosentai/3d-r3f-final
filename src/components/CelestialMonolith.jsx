import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * CelestialMonolith Component
 * 
 * Втілює вимоги:
 * 1. Складна модель (Complex GLTF/GLB Model):
 *    - Завантаження та відображення високої деталізації PBR-моделі `celestial-relic.glb`.
 *    - Налаштування властивостей матеріалів: castShadow, receiveShadow, обробка нормалей.
 * 2. Анімація:
 *    - Левітація артефакту (синусоїдальні коливання висоти).
 *    - Постійне плавне обертання навколо власної осі Y.
 *    - Багатошарові орбітальні золоті кільця, що обертаються з різними швидкостями.
 * 3. Інтерактивність:
 *    - Hover ефект: збільшення швидкості обертання та підсилення сяйва при наведенні курсору.
 */
export function CelestialMonolith({ position = [0, 1.8, 0], scale = 1.3 }) {
  const groupRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const relicRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Завантажуємо складну 3D модель (DamagedHelmet / Celestial Relic)
  const { scene } = useGLTF('/models/celestial-relic.glb')

  // Налаштовуємо всі меші моделі для відкидання і прийому тіней
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const rotSpeed = hovered ? 1.5 : 0.5

    // Левітація артефакту в повітрі
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.18
    }

    // Обертання самої реліквії
    if (relicRef.current) {
      relicRef.current.rotation.y += delta * rotSpeed
    }

    // Обертання орбітальних священних кілець за різними осями
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.8
      ring1Ref.current.rotation.y = t * 0.6
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.5
      ring2Ref.current.rotation.z = t * 0.7
    }
  })

  // Клонуємо сцену для безпечного налаштування тіней
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.envMapIntensity = 1.4
          child.material.needsUpdate = true
        }
      }
    })
    return clone
  }, [scene])

  return (
    <group position={position}>
      {/* ================= П'ЄДЕСТАЛ ВІВТАРЯ ================= */}
      <group position={[0, -0.6, 0]}>
        {/* Базова плита вівтаря */}
        <mesh castShadow receiveShadow position={[0, -0.4, 0]}>
          <cylinderGeometry args={[1.8, 2.1, 0.4, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Рунічна вставка */}
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

      {/* ================= ЛЕВІТУЮЧИЙ БЛОК АРТЕФАКТУ ================= */}
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Світло підсвітки реліквії */}
        <pointLight
          color={hovered ? '#67e8f9' : '#38bdf8'}
          intensity={hovered ? 3.0 : 1.8}
          distance={6}
          decay={2}
        />

        {/* 1. Складна модель (GLTF) */}
        <group ref={relicRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
          <primitive object={clonedScene} />
        </group>

        {/* 2. Орбітальне кільце 1 (Torus примітив) */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.8, 0.035, 16, 48]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.2}
            metalness={0.9}
            emissive="#b45309"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* 3. Орбітальне кільце 2 (Torus примітив) */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.1, 0.025, 16, 48]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.15}
            metalness={0.85}
            emissive="#0284c7"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    </group>
  )
}

// Попереднє завантаження моделі в пам'ять (preload)
useGLTF.preload('/models/celestial-relic.glb')
