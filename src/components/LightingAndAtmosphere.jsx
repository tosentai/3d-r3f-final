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

  // М'які, приємні для очей конфігурації доби
  const config = {
    noon: {
      sunColor: '#fef3c7',
      sunIntensity: 1.15,
      sunPos: [10, 16, 8],
      skyColor: '#60a5fa',
      groundColor: '#1e293b',
      hemiIntensity: 0.5,
      turbidity: 2.5,
      rayleigh: 0.28,
      mieCoefficient: 0.002,
      mieDirectionalG: 0.65,
      sparkleColor: '#38bdf8',
      fogColor: '#090e1a',
    },
    sunset: {
      sunColor: '#fb923c',
      sunIntensity: 0.95,
      sunPos: [14, 5, -12],
      skyColor: '#a855f7',
      groundColor: '#2e1065',
      hemiIntensity: 0.4,
      turbidity: 4.2,
      rayleigh: 0.65,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.75,
      sparkleColor: '#fbbf24',
      fogColor: '#120a1c',
    },
    night: {
      sunColor: '#93c5fd',
      sunIntensity: 0.55,
      sunPos: [-10, 16, 10],
      skyColor: '#1e3a8a',
      groundColor: '#020617',
      hemiIntensity: 0.3,
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

      {/* 2. Головне спрямоване джерело світла із тінями (DirectionalLight) */}
      <directionalLight
        ref={sunLightRef}
        position={config.sunPos}
        color={config.sunColor}
        intensity={config.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={65}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* 3. Додаткове контрове заповнююче світло без тіней (Fill Light) */}
      <directionalLight
        position={[-config.sunPos[0], -config.sunPos[1] * 0.5, -config.sunPos[2]]}
        color={config.skyColor}
        intensity={0.25}
      />

      {/* 4. Небосхил (Sky) або Зоряне небо (Stars) */}
      {timeOfDay === 'night' ? (
        <Stars radius={80} depth={50} count={3500} factor={4} saturation={0.5} fade speed={1} />
      ) : (
        <Sky
          sunPosition={config.sunPos}
          turbidity={config.turbidity}
          rayleigh={config.rayleigh}
          mieCoefficient={config.mieCoefficient}
          mieDirectionalG={config.mieDirectionalG}
        />
      )}

      {/* 5. Магічні світлові пилинки/частинки в повітрі */}
      <Sparkles
        count={80}
        scale={20}
        size={3}
        speed={0.3}
        opacity={0.55}
        color={config.sparkleColor}
      />

      {/* 6. Контактні м'які тіні під островом */}
      <ContactShadows
        position={[0, -7.5, 0]}
        opacity={0.65}
        scale={28}
        blur={2}
        far={15}
        resolution={1024}
        color="#000000"
      />
    </>
  )
}
