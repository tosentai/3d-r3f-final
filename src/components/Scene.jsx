import React, { useRef, useEffect, useState, Suspense } from 'react'
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
 * Анімований контролер позиції камери.
 * 
 * ВАЖЛИВО:
 * Інтерполяція (lerp) відбувається ТІЛЬКИ при перемиканні пресету (кнопки в UI).
 * Як тільки користувач торкається миші (обертання, зум, панорамування),
 * інтерполяція миттєво вимикається, даючи 100% повну свободу огляду без відкату назад!
 */
function CameraRig({ preset = 'default' }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const isTransitioningRef = useRef(false)
  const lastPresetRef = useRef(preset)
  const transitionTimeRef = useRef(0)

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

  // При зміні пресету запускаємо плавну анімацію переходу
  useEffect(() => {
    if (preset !== lastPresetRef.current) {
      lastPresetRef.current = preset
      isTransitioningRef.current = true
      transitionTimeRef.current = 0
    }
  }, [preset])

  // Якщо користувач сам почав крутити або зумити камеру - вимикаємо авто-перехід
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const handleStart = () => {
      isTransitioningRef.current = false
    }

    controls.addEventListener('start', handleStart)
    return () => controls.removeEventListener('start', handleStart)
  }, [])

  useFrame((_, delta) => {
    if (!isTransitioningRef.current) return

    const desiredPos = targetPositions[preset] || targetPositions.default
    const desiredLookAt = targetLookAts[preset] || targetLookAts.default

    transitionTimeRef.current += delta

    // Плавний перехід камери до цільового положення
    camera.position.lerp(desiredPos, delta * 3.5)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredLookAt, delta * 3.5)
      controlsRef.current.update()
    }

    // Завершуємо перехід, коли камера наблизилася або минуло 1.5 секунди
    if (camera.position.distanceTo(desiredPos) < 0.1 || transitionTimeRef.current > 1.5) {
      isTransitioningRef.current = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.06}
      minDistance={3.0}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 + 0.1}
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
  cameraPreset,
  onPortalClick,
  physicsApiRef
}) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 7.5, 17], fov: 45, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance'
        }}
      >
        {/* Контролер камери */}
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

            {/* Кастомний GLSL Шейдер порталу з інтерактивним кліком */}
            <CelestialPortal
              position={[0, 4.4, -8]}
              speed={portalSpeed}
              intensity={portalIntensity}
              onPortalClick={onPortalClick}
            />

            {/* Фізичні об'єкти (скрині, сфери, чаші, обеліски) */}
            <PhysicsRunes
              runes={runes}
              onRuneClick={onRuneClick}
              physicsApiRef={physicsApiRef}
            />
          </Physics>

          {/* Кінематографічні пост-ефекти рендера */}
          <PostProcessingEffects
            enableBloom={true}
            enableVignette={true}
            bloomIntensity={timeOfDay === 'night' ? 1.0 : 0.75}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
