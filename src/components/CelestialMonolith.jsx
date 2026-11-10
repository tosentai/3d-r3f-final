import React, { useRef, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Внутрішній завантажувач складної 3D моделі (GLTF).
 * 
 * ВАЖЛИВО:
 * Автоматичний розрахунок BoundingBox та центрування нормалізує будь-яку 3D-модель
 * до ідеального розміру (1.35 одиниці), щоб вона акуратно стояла на вівтарі всередині кілець
 * і ніколи не роздувалася на весь екран!
 */
function RelicModel({ scale = 1.0 }) {
  const { scene } = useGLTF('/models/celestial-relic.glb')

  const { normalizedScene, finalScale } = React.useMemo(() => {
    const clone = scene.clone(true)

    // 1. Обчислюємо розміри габаритного контейнера (Bounding Box)
    const bbox = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    bbox.getSize(size)
    const center = new THREE.Vector3()
    bbox.getCenter(center)

    // 2. Центруємо модель навколо локального початку координат (0, 0, 0)
    clone.position.x = -center.x
    clone.position.y = -center.y
    clone.position.z = -center.z

    // 3. Нормалізуємо масштаб: модель завжди матиме заданий габарит (1.35)
    const maxDim = Math.max(size.x, size.y, size.z) || 1.0
    const desiredSize = 1.35 * scale
    const calculatedScale = desiredSize / maxDim

    // 4. Налаштовуємо красивий античний PBR матеріал та тіні
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#f59e0b'),
          metalness: 0.85,
          roughness: 0.28,
          emissive: new THREE.Color('#b45309'),
          emissiveIntensity: 0.25,
        })
      }
    })

    return { normalizedScene: clone, finalScale: calculatedScale }
  }, [scene, scale])

  return (
    <group scale={[finalScale, finalScale, finalScale]}>
      <primitive object={normalizedScene} />
    </group>
  )
}

/**
 * Плейсхолдер кристала (відображається миттєво доки вантажиться модель)
 */
function CrystalPlaceholder() {
  return (
    <mesh castShadow receiveShadow>
      <octahedronGeometry args={[0.7, 0]} />
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
export function CelestialMonolith({ position = [0, 1.6, 0], scale = 1.0 }) {
  const groupRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const relicRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const rotSpeed = hovered ? 1.5 : 0.45

    // М'яка левітація
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

        {/* 1. Складна 3D модель з автоматичним масштабуванням */}
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

useGLTF.preload('/models/celestial-relic.glb')
