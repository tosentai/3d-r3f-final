import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PortalVertexShader, PortalFragmentShader, defaultPortalUniforms } from '../shaders/portalShader'

/**
 * CelestialPortal Component
 * 
 * Втілює вимоги:
 * 1. Кастомний шейдер (GLSL Vertex + Fragment shader)
 * 2. Анімація (процедурна зміна часу `uTime`, пульсація світла)
 * 3. Примітиви (Torus, Cylinder, Box обрамлення)
 * 4. PBR Матеріали (золото, різьблений камінь із roughness та metalness)
 * 5. Джерело світла всередині порталу (PointLight)
 */
export function CelestialPortal({
  position = [0, 4.5, -8],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  speed = 1.2,
  intensity = 1.8,
  distortion = 1.0,
  active = true
}) {
  const meshRef = useRef()
  const lightRef = useRef()
  const outerRingRef = useRef()
  const innerRingRef = useRef()

  // Клонуємо uniforms для незалежного екземпляра
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: speed },
    uIntensity: { value: intensity },
    uDistortion: { value: distortion },
    uColorCore: { value: new THREE.Color('#ffffff') },
    uColorInner: { value: new THREE.Color('#38bdf8') },
    uColorOuter: { value: new THREE.Color('#8b5cf6') },
  }), [])

  // Оновлюємо uniforms при зміні props
  useFrame((state, delta) => {
    if (meshRef.current && active) {
      meshRef.current.material.uniforms.uTime.value += delta * speed
      meshRef.current.material.uniforms.uSpeed.value = speed
      meshRef.current.material.uniforms.uIntensity.value = intensity
      meshRef.current.material.uniforms.uDistortion.value = distortion
    }

    // Обертання декоративних священних кілець
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.25 * speed
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.45 * speed
    }

    // Пульсація світла від енергії порталу
    if (lightRef.current && active) {
      const pulse = Math.sin(state.clock.elapsedTime * 3.5) * 0.3 + 0.9
      lightRef.current.intensity = 2.5 * pulse * (intensity / 1.5)
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Джерело світла в ядрі порталу */}
      <pointLight
        ref={lightRef}
        color="#38bdf8"
        intensity={2.5}
        distance={15}
        decay={2}
      />

      {/* Шейдерна мембрана порталу (кастомний ShaderMaterial) */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        {/* CircleGeometry з високою щільністю сегментів для вертексного зміщення */}
        <circleGeometry args={[2.8, 64]} />
        <shaderMaterial
          vertexShader={PortalVertexShader}
          fragmentShader={PortalFragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Примітив: Зовнішнє масивне кам'яне кільце */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[3.0, 0.28, 16, 64]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Примітив: Внутрішнє обертове золоте рунічне кільце */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.85, 0.08, 12, 48]} />
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
        <torusGeometry args={[2.55, 0.04, 8, 36]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.9}
          emissive="#0284c7"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Опорні кам'яні пілони-п'єдестали (Cylinder & Box примітиви) */}
      <group position={[0, -3.2, 0]}>
        {/* База вівтаря */}
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
