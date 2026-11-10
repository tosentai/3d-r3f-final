import React, { useRef } from 'react'
import { Sky, Sparkles, ContactShadows, Stars } from '@react-three/drei'
import * as THREE from 'three'

/**
 * LightingAndAtmosphere Component
 * 
 * Налаштування збалансованого освітлення:
 * - Прибрано засліплюючу яскравість (знижено rayleigh та mie у Sky).
 * - Сонце дає м'яке кінематографічне світло без перепаленого білого неба.
 * - Чіткі реалістичні тіні з PCFSoftShadowMap.
 */
export function LightingAndAtmosphere({ timeOfDay = 'sunset' }) {
  const sunLightRef = useRef()

  // М'які, спокійні для очей конфігурації доби
  const config = {
    noon: {
      sunColor: '#e2e8f0',
      sunIntensity: 0.72,
      sunPos: [8, 14, 6],
      skyColor: '#38bdf8',
      groundColor: '#1e293b',
      hemiIntensity: 0.35,
      turbidity: 1.5,
      rayleigh: 0.16, // Кардинально знижено розсіювання, що сліпило очі
      mieCoefficient: 0.001,
      mieDirectionalG: 0.55,
      sparkleColor: '#38bdf8',
      fogColor: '#070c16',
    },
    sunset: {
      sunColor: '#f97316',
      sunIntensity: 0.65,
      sunPos: [12, 4, -14],
      skyColor: '#7c3aed',
      groundColor: '#2e1065',
      hemiIntensity: 0.3,
      turbidity: 2.8,
      rayleigh: 0.35, // М'який теплий вечір без яскравого сонячного диску
      mieCoefficient: 0.003,
      mieDirectionalG: 0.65,
      sparkleColor: '#fbbf24',
      fogColor: '#0f0817',
    },
    night: {
      sunColor: '#93c5fd',
      sunIntensity: 0.45,
      sunPos: [-10, 16, 10],
      skyColor: '#1e3a8a',
      groundColor: '#020617',
      hemiIntensity: 0.25,
      turbidity: 10,
      rayleigh: 0.2,
      mieCoefficient: 0.001,
      mieDirectionalG: 0.5,
      sparkleColor: '#38bdf8',
      fogColor: '#030712',
    },
  }[timeOfDay] || config.sunset

  return (
    <>
      {/* Атмосферний туман для глибини сцени */}
      <color attach="background" args={[config.fogColor]} />
      <fog attach="fog" args={[config.fogColor, 22, 80]} />

      {/* 1. Напівсферичне розсіяне світло (HemisphereLight) */}
      <hemisphereLight
        skyColor={config.skyColor}
        groundColor={config.groundColor}
        intensity={config.hemiIntensity}
      />

      {/* 2. Головне спрямоване джерело світла із оптимізованим frustum */}
      <directionalLight
        ref={sunLightRef}
        position={config.sunPos}
        color={config.sunColor}
        intensity={config.sunIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* 3. Додаткове контрове заповнююче світло без тіней (Fill Light) */}
      <directionalLight
        position={[-config.sunPos[0], -config.sunPos[1] * 0.5, -config.sunPos[2]]}
        color={config.skyColor}
        intensity={0.2}
      />

      {/* 4. Небосхил (Sky) або Зоряне небо (Stars) */}
      {timeOfDay === 'night' ? (
        <Stars radius={80} depth={50} count={2500} factor={3.5} saturation={0.5} fade speed={0.8} />
      ) : (
        <Sky
          sunPosition={config.sunPos}
          turbidity={config.turbidity}
          rayleigh={config.rayleigh}
          mieCoefficient={config.mieCoefficient}
          mieDirectionalG={config.mieDirectionalG}
        />
      )}

      {/* 5. Легкі магічні світлові частинки в повітрі (оптимізовано для FPS) */}
      <Sparkles
        count={35}
        scale={18}
        size={2.8}
        speed={0.25}
        opacity={0.45}
        color={config.sparkleColor}
      />

      {/* 6. Контактні м'які тіні під островом (frames=1 для максимальної продуктивності) */}
      <ContactShadows
        position={[0, -7.5, 0]}
        opacity={0.65}
        scale={28}
        blur={2}
        far={15}
        resolution={512}
        frames={1}
        color="#000000"
      />
    </>
  )
}
