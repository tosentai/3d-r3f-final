import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PortalVertexShader, PortalFragmentShader } from '../shaders/portalShader'

/**
 * CelestialPortal Component
 * 
 * Інтерактивність:
 * - При кліку ЛКМ по порталу відбувається розрив простору:
 *   1. Розходиться анімована енергетична ударна хвиля (Shockwave Ring).
 *   2. Швидкість та інтенсивність шейдера різко зростають (Warp Surge).
 *   3. Ядро порталу яскраво спалахує.
 *   4. Викликається `onPortalClick`, що викидає з порталу фізичний артефакт!
 */
export function CelestialPortal({
  position = [0, 4.5, -8],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  speed = 1.2,
  intensity = 1.8,
  distortion = 1.0,
  active = true,
  onPortalClick
}) {
  const meshRef = useRef()
  const lightRef = useRef()
  const outerRingRef = useRef()
  const innerRingRef = useRef()
  const shockwaveRef = useRef()

  // Коефіцієнт сплеску енергії при кліку (від 1.0 спадає до 0.0)
  const surgeRef = useRef(0)
  const [hovered, setHovered] = useState(false)

  // Клонуємо uniforms для шейдера
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: speed },
    uIntensity: { value: intensity },
    uDistortion: { value: distortion },
    uColorCore: { value: new THREE.Color('#ffffff') },
    uColorInner: { value: new THREE.Color('#38bdf8') },
    uColorOuter: { value: new THREE.Color('#8b5cf6') },
  }), [])

  // Обробник кліку по порталу
  const handleClick = (e) => {
    e.stopPropagation()
    surgeRef.current = 1.0 // Запускаємо енергетичний сплеск

    if (onPortalClick) {
      onPortalClick()
    }
  }

  useFrame((state, delta) => {
    // Плавне згасання сплеску після кліку
    surgeRef.current = THREE.MathUtils.lerp(surgeRef.current, 0, delta * 2.2)
    const surge = surgeRef.current

    const effectiveSpeed = speed * (1.0 + surge * 3.5)
    const effectiveIntensity = intensity * (1.0 + surge * 2.0)
    const effectiveDistortion = distortion * (1.0 + surge * 2.5)

    if (meshRef.current && active) {
      meshRef.current.material.uniforms.uTime.value += delta * effectiveSpeed
      meshRef.current.material.uniforms.uSpeed.value = effectiveSpeed
      meshRef.current.material.uniforms.uIntensity.value = effectiveIntensity
      meshRef.current.material.uniforms.uDistortion.value = effectiveDistortion
    }

    // Обертання декоративних кілець із прискоренням при сплеску
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * (0.25 + surge * 2.0)
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * (0.45 + surge * 2.5)
    }

    // Спалах світла в порталі
    if (lightRef.current && active) {
      const pulse = Math.sin(state.clock.elapsedTime * 3.5) * 0.3 + 0.9
      lightRef.current.intensity = (2.5 * pulse + surge * 8.0) * (intensity / 1.5)
      lightRef.current.color.set(surge > 0.3 ? '#a5f3fc' : '#38bdf8')
    }

    // Анімація ударної хвилі (розширення та згасання прозорості)
    if (shockwaveRef.current) {
      if (surge > 0.02) {
        const progress = 1.0 - surge
        const currentScale = 1.0 + progress * 4.5
        shockwaveRef.current.scale.set(currentScale, currentScale, 1)
        shockwaveRef.current.material.opacity = surge * 0.9
        shockwaveRef.current.visible = true
      } else {
        shockwaveRef.current.visible = false
      }
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Джерело світла в ядрі порталу */}
      <pointLight
        ref={lightRef}
        color="#38bdf8"
        intensity={2.5}
        distance={18}
        decay={2}
      />

      {/* Ударна хвиля (розширюється при кліку ЛКМ) */}
      <mesh ref={shockwaveRef} position={[0, 0, 0.05]} visible={false}>
        <ringGeometry args={[2.7, 3.2, 36]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Інтерактивна шейдерна мембрана порталу */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        cursor="pointer"
      >
        <circleGeometry args={[2.8, 36]} />
        <shaderMaterial
          vertexShader={PortalVertexShader}
          fragmentShader={PortalFragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Підказка при наведенні (світіння контуру) */}
      {hovered && (
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[2.75, 2.9, 36]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Примітив: Зовнішнє масивне кам'яне кільце */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[3.0, 0.28, 12, 36]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Примітив: Внутрішнє обертове золоте рунічне кільце */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.85, 0.08, 10, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.25}
          metalness={0.85}
          emissive="#b45309"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Примітив: Тонке концентричне кільце зворотної ротації */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[2.55, 0.04, 8, 28]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.9}
          emissive="#0284c7"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Опорні кам'яні пілони-п'єдестали */}
      <group position={[0, -3.2, 0]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[3.6, 0.6, 1.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[2.8, 0.3, 1.1]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
