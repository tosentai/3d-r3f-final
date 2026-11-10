import React, { useState, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Scene } from './components/Scene'
import { HUD } from './components/UI/HUD'

// Початкові предмети на святилищі
const initialRunes = [
  {
    id: 1,
    type: 'chest',
    position: [-2.2, 2.0, -2.5],
    color: '#f59e0b',
    emissive: '#d97706',
    size: 0.9,
    mass: 2.0,
    restitution: 0.25,
  },
  {
    id: 2,
    type: 'orb',
    position: [2.5, 2.5, -1.8],
    color: '#38bdf8',
    emissive: '#0284c7',
    size: 1.0,
    mass: 1.2,
    restitution: 0.65,
  },
  {
    id: 3,
    type: 'chalice',
    position: [0.0, 3.0, 2.6],
    color: '#ec4899',
    emissive: '#be185d',
    size: 0.95,
    mass: 1.4,
    restitution: 0.35,
  },
]

export default function App() {
  const [timeOfDay, setTimeOfDay] = useState('sunset')
  const [gravityPreset, setGravityPreset] = useState('earth')
  const [cameraPreset, setCameraPreset] = useState('default')
  const [portalSpeed, setPortalSpeed] = useState(1.2)
  const [portalIntensity, setPortalIntensity] = useState(1.8)
  const [runes, setRunes] = useState(initialRunes)
  const [portalNotification, setPortalNotification] = useState(null)

  const physicsApiRef = useRef(null)

  // Вектор гравітації відповідно до обраного режиму
  const gravity = {
    earth: [0, -9.81, 0],
    moon: [0, -2.5, 0],
    zero: [0, -0.4, 0], // М'яке невагоме ширяння над островом (без відлітання вгору)
  }[gravityPreset] || [0, -9.81, 0]

  // Додавання нового предмета (скриня, сфера, чаша, обеліск)
  const handleSpawnRune = useCallback((type) => {
    const id = Date.now() + Math.random()
    const x = (Math.random() - 0.5) * 5.5
    const z = (Math.random() - 0.5) * 5.5
    const y = Math.random() * 2 + 5

    const colorPalettes = {
      chest: ['#f59e0b', '#d97706', '#b45309'],
      orb: ['#38bdf8', '#0ea5e9', '#67e8f9', '#a855f7'],
      chalice: ['#fbbf24', '#f43f5e', '#ec4899', '#c084fc'],
      obelisk: ['#10b981', '#34d399', '#06b6d4', '#6366f1'],
    }

    const colors = colorPalettes[type] || ['#38bdf8']
    const color = colors[Math.floor(Math.random() * colors.length)]

    const newRune = {
      id,
      type,
      position: [x, y, z],
      color,
      emissive: color,
      size: Math.random() * 0.25 + 0.85,
      mass: type === 'chest' ? 2.2 : type === 'obelisk' ? 1.8 : 1.2,
      restitution: type === 'orb' ? 0.7 : 0.35,
      friction: 0.7,
    }

    setRunes((prev) => [...prev, newRune])

    // Ефект конфетті
    if (Math.random() > 0.6) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.85 },
        colors: [color, '#ffffff']
      })
    }
  }, [])

  // Клік по порталу: м'яка гравітаційна хвиля та вихід нового предмета
  const handlePortalClick = useCallback(() => {
    // 1. М'яка ударна хвиля (зменшена сила)
    if (physicsApiRef.current) {
      physicsApiRef.current.applyShockwave([0, 4.4, -8], 4.5)
    }

    // 2. Портал плавно випускає новий магічний артефакт уперед
    const types = ['chest', 'orb', 'chalice', 'obelisk']
    const randomType = types[Math.floor(Math.random() * types.length)]
    const newId = Date.now()

    const launchedItem = {
      id: newId,
      type: randomType,
      position: [(Math.random() - 0.5) * 0.6, 3.6, -7.0],
      initialImpulse: {
        x: (Math.random() - 0.5) * 0.8,
        y: -0.2, // Плавний спуск по сходах
        z: 4.2,  // Помірний м'який рух уперед до центру
      },
      color: '#38bdf8',
      emissive: '#0284c7',
      size: 1.0,
      mass: 1.5,
      restitution: randomType === 'orb' ? 0.65 : 0.35,
      friction: 0.65,
    }

    setRunes((prev) => [...prev, launchedItem])

    // 3. Святковий спалах частинок
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#38bdf8', '#818cf8', '#f59e0b', '#ffffff']
    })

    // 4. Повідомлення на екрані
    setPortalNotification('🌌 Портал активовано: ударна хвиля та матеріалізація артефакту!')
    setTimeout(() => {
      setPortalNotification(null)
    }, 3500)
  }, [])

  // Очищення рун
  const handleClearRunes = useCallback(() => {
    setRunes([])
  }, [])

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060913]">
      {/* 3D Сцена */}
      <Scene
        timeOfDay={timeOfDay}
        gravity={gravity}
        runes={runes}
        portalSpeed={portalSpeed}
        portalIntensity={portalIntensity}
        cameraPreset={cameraPreset}
        onPortalClick={handlePortalClick}
        physicsApiRef={physicsApiRef}
      />

      {/* Інтерфейс користувача (HUD) */}
      <HUD
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        gravityPreset={gravityPreset}
        setGravityPreset={setGravityPreset}
        onSpawnRune={handleSpawnRune}
        onClearRunes={handleClearRunes}
        runeCount={runes.length}
        portalSpeed={portalSpeed}
        setPortalSpeed={setPortalSpeed}
        portalIntensity={portalIntensity}
        setPortalIntensity={setPortalIntensity}
        activeCameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        portalNotification={portalNotification}
      />
    </main>
  )
}
