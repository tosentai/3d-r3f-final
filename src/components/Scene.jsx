import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'

import { FloatingIsland } from './FloatingIsland'
import { CelestialMonolith } from './CelestialMonolith'
import { CelestialPortal } from './CelestialPortal'
import { PhysicsRunes } from './PhysicsRunes'
import { LightingAndAtmosphere } from './LightingAndAtmosphere'
import { PostProcessingEffects } from './PostProcessingEffects'

/**
 * Анімований контролер позиції камери для плавного перемикання ракурсів
 */
function CameraRig({ preset = 'default' }) {
  const { camera } = useThree()
  const controlsRef = useRef()

  const targetPositions = {
    default: new THREE.Vector3(0, 7.5, 17),
    portal: new THREE.Vector3(0, 5.0, -1.8),
    monolith: new THREE.Vector3(0, 3.2, 5.2),
  }

  const targetLookAts = {
    default: new THREE.Vector3(0, 1.5, 0),
    portal: new THREE.Vector3(0, 4.5, -8),
    monolith: new THREE.Vector3(0, 2.0, 0),
  }

  const desiredPos = targetPositions[preset] || targetPositions.default
  const desiredLookAt = targetLookAts[preset] || targetLookAts.default

  useFrame((_, delta) => {
    // Плавна інтерполяція (lerp) положення камери та цілі
    camera.position.lerp(desiredPos, delta * 2.5)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredLookAt, delta * 2.5)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={3.5}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 + 0.05} // Не опускатися занадто глибоко під горизонт
    />
  )
}

/**
 * 3D Loader для плавного завантаження GLTF моделей
 */
function Loader3D() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 glass-panel px-6 py-4 rounded-2xl">
        <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-cinzel text-sky-200 tracking-wider">
          Завантаження святилища...
        </span>
      </div>
    </Html>
  )
}

/**
 * Головний контейнер 3D сцени
 */
export function Scene({
  timeOfDay,
  gravity,
  runes,
  onRuneClick,
  portalSpeed,
  portalIntensity,
  cameraPreset
}) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 7.5, 17], fov: 45, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance'
        }}
      >
        {/* Контролер камери з підтримкою пресетів */}
        <CameraRig preset={cameraPreset} />

        {/* Динамічне освітлення, атмосфера та тіні */}
        <LightingAndAtmosphere timeOfDay={timeOfDay} />

        {/* Асинхронне завантаження з Suspense */}
        <Suspense fallback={<Loader3D />}>
          {/* Фізичний рушій Rapier */}
          <Physics gravity={gravity} colliders={false}>
            {/* Ширяючий острів (основа + колони + колайдери) */}
            <FloatingIsland />

            {/* Складна 3D модель артефакту (GLTF) на вівтарі */}
            <CelestialMonolith position={[0, 1.6, 0]} scale={1.25} />

            {/* Кастомний GLSL Шейдер порталу */}
            <CelestialPortal
              position={[0, 4.4, -8]}
              speed={portalSpeed}
              intensity={portalIntensity}
            />

            {/* Фізичні об'єкти (руни, куби, сфери) */}
            <PhysicsRunes runes={runes} onRuneClick={onRuneClick} />
          </Physics>

          {/* Кінематографічні пост-ефекти рендера */}
          <PostProcessingEffects
            enableBloom={true}
            enableVignette={true}
            bloomIntensity={timeOfDay === 'night' ? 1.5 : 1.1}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
