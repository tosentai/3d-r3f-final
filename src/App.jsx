import React, { useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Scene } from './components/Scene'
import { HUD } from './components/UI/HUD'

// Початкові руни для наповнення сцени
const initialRunes = [
  { id: 1, type: 'cube', position: [-2.2, 2.5, -2.5], color: '#38bdf8', emissive: '#0284c7', size: 0.75, mass: 1.5, restitution: 0.3 },
  { id: 2, type: 'sphere', position: [2.5, 3.0, -1.8], color: '#ec4899', emissive: '#be185d', size: 0.7, mass: 1.0, restitution: 0.6 },
  { id: 3, type: 'pyramid', position: [0.2, 4.0, 2.8], color: '#f59e0b', emissive: '#d97706', size: 0.8, mass: 1.2, restitution: 0.4 },
]

export default function App() {
  const [timeOfDay, setTimeOfDay] = useState('sunset')
  const [gravityPreset, setGravityPreset] = useState('earth')
  const [cameraPreset, setCameraPreset] = useState('default')
  const [portalSpeed, setPortalSpeed] = useState(1.2)
  const [portalIntensity, setPortalIntensity] = useState(1.8)
  const [runes, setRunes] = useState(initialRunes)

  // Вектор гравітації відповідно до обраного режиму
  const gravity = {
    earth: [0, -9.81, 0],
    moon: [0, -2.5, 0],
    zero: [0, 2.8, 0], // Антигравітаційне підняття уламків у повітря!
  }[gravityPreset] || [0, -9.81, 0]

  // Додавання нової руни з випадковими параметрами
  const handleSpawnRune = useCallback((type) => {
    const id = Date.now() + Math.random()
    // Випадкова позиція над платформою острова
    const x = (Math.random() - 0.5) * 6
    const z = (Math.random() - 0.5) * 6
    const y = Math.random() * 2 + 5

    const colorPalettes = {
      cube: ['#38bdf8', '#0ea5e9', '#60a5fa', '#818cf8'],
      sphere: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7'],
      pyramid: ['#f59e0b', '#eab308', '#84cc16', '#10b981'],
    }

    const colors = colorPalettes[type] || ['#38bdf8']
    const color = colors[Math.floor(Math.random() * colors.length)]

    const newRune = {
      id,
      type,
      position: [x, y, z],
      color,
      emissive: color,
      size: Math.random() * 0.3 + 0.6,
      mass: Math.random() * 1.5 + 0.8,
      restitution: type === 'sphere' ? 0.65 : 0.35,
      friction: 0.7,
    }

    setRunes((prev) => [...prev, newRune])

    // Міні-конфетті ефект на UI
    if (Math.random() > 0.7) {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.85 },
        colors: [color, '#ffffff']
      })
    }
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
      />
    </main>
  )
}
