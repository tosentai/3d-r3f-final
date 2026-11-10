import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Sparkles, ContactShadows, Stars } from '@react-three/drei'
import * as THREE from 'three'

/**
 * LightingAndAtmosphere Component
 * 
 * Втілює вимоги:
 * 1. Освітлення (Lighting):
 *    - DirectionalLight: основне джерело сонячного/місячного світла.
 *    - HemisphereLight: природне світло небосхилу та відбиття від землі.
 *    - PointLight: локальні джерела світіння магічних елементів.
 * 2. Тіні (Shadows):
 *    - Високоякісна тіньова карта (2048x2048) з точним frustum для максимальної чіткості.
 *    - Тонке налаштування `shadow-bias` (-0.0001) та `shadow-normalBias` (0.02) для усунення артефактів "shadow acne".
 *    - ContactShadows під островом для реалістичного м'якого затінення підвішених об'єктів.
 * 3. Динамічна зміна доби (Day / Sunset / Night).
 */
export function LightingAndAtmosphere({ timeOfDay = 'sunset' }) {
  const sunLightRef = useRef()

  // Колірні та інтенсивні конфігурації для різних часів доби
  const config = {
    noon: {
      sunColor: '#fffbeb',
      sunIntensity: 2.2,
      sunPos: [15, 22, 10],
      skyColor: '#38bdf8',
      groundColor: '#1e293b',
      hemiIntensity: 0.7,
      turbidity: 4,
      rayleigh: 0.6,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      sparkleColor: '#38bdf8',
      fogColor: '#0f172a',
    },
    sunset: {
      sunColor: '#fdba74',
      sunIntensity: 2.0,
      sunPos: [20, 8, -12],
      skyColor: '#c084fc',
      groundColor: '#3b0764',
      hemiIntensity: 0.55,
      turbidity: 8,
      rayleigh: 2.5,
      mieCoefficient: 0.025,
      mieDirectionalG: 0.95,
      sparkleColor: '#fcd34d',
      fogColor: '#1e112a',
    },
    night: {
      sunColor: '#93c5fd',
      sunIntensity: 0.8,
      sunPos: [-12, 18, 12],
      skyColor: '#1e3a8a',
      groundColor: '#020617',
      hemiIntensity: 0.35,
      turbidity: 10,
      rayleigh: 0.2,
      mieCoefficient: 0.001,
      mieDirectionalG: 0.5,
      sparkleColor: '#67e8f9',
      fogColor: '#030712',
    },
  }[timeOfDay] || config.sunset

  return (
    <>
      {/* Атмосферний туман для глибини сцени */}
      <color attach="background" args={[config.fogColor]} />
      <fog attach="fog" args={[config.fogColor, 20, 75]} />

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
        intensity={0.3}
      />

      {/* 4. Небосхил (Sky) або Зоряне небо (Stars) залежно від часу доби */}
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
        count={100}
        scale={20}
        size={3.5}
        speed={0.35}
        opacity={0.65}
        color={config.sparkleColor}
      />

      {/* 6. Контактні м'які тіні під островом */}
      <ContactShadows
        position={[0, -7.5, 0]}
        opacity={0.7}
        scale={28}
        blur={2}
        far={15}
        resolution={1024}
        color="#000000"
      />
    </>
  )
}
