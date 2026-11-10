import React, { useRef, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

/**
 * PhysicsRunes Component - Справжні магічні артефакти:
 * 1. "chest" - Стародавня Рунічна Скриня з золотими кутиками та замком.
 * 2. "orb" - Астральна Сфера у подвійних гіроскопічних золотих кільцях.
 * 3. "chalice" - Небесна Сакральна Чаша (античний золотий кубок).
 * 4. "obelisk" - Рунічний Обеліск із сяючими знаками та золотим вістрям.
 */
export function PhysicsRunes({ runes = [], onRuneClick, physicsApiRef }) {
  const bodiesMapRef = useRef(new Map())

  // Експортуємо API для поштовху всіх предметів ударною хвилею порталу
  useEffect(() => {
    if (physicsApiRef) {
      physicsApiRef.current = {
        applyShockwave: (origin = [0, 4.5, -8], power = 4.5) => {
          bodiesMapRef.current.forEach((body) => {
            if (!body) return
            try {
              const pos = body.translation()
              const dx = pos.x - origin[0]
              const dz = pos.z - origin[2]
              const dist = Math.max(1.5, Math.sqrt(dx * dx + dz * dz))
              const force = (power / dist) * 0.9

              // М'який імпульс по поверхні острова від порталу
              body.applyImpulse(
                {
                  x: (dx / dist) * force,
                  y: Math.random() * 0.3 + 0.1, // Дуже легкий підйом
                  z: (dz / dist) * force,
                },
                true
              )
              body.applyTorqueImpulse(
                {
                  x: (Math.random() - 0.5) * 0.6,
                  y: (Math.random() - 0.5) * 0.6,
                  z: (Math.random() - 0.5) * 0.6,
                },
                true
              )
            } catch (err) {
              // Ignore if body unmounted
            }
          })
        },
      }
    }
  }, [physicsApiRef])

  return (
    <group>
      {runes.map((rune) => (
        <RuneItem
          key={rune.id}
          rune={rune}
          registerBody={(body) => {
            if (body) bodiesMapRef.current.set(rune.id, body)
            else bodiesMapRef.current.delete(rune.id)
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (onRuneClick) onRuneClick(rune.id)
          }}
        />
      ))}
    </group>
  )
}

function RuneItem({ rune, onClick, registerBody }) {
  const rigidBodyRef = useRef()

  useEffect(() => {
    if (rigidBodyRef.current) {
      registerBody(rigidBodyRef.current)
      // Якщо об'єкту передано початковий імпульс (наприклад, вистріл з порталу)
      if (rune.initialImpulse) {
        rigidBodyRef.current.applyImpulse(rune.initialImpulse, true)
      }
    }
    return () => registerBody(null)
  }, [rune, registerBody])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    // При кліку по предмету надаємо йому спрямований поштовх вгору
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyImpulse(
        {
          x: (Math.random() - 0.5) * 6,
          y: Math.random() * 5 + 4,
          z: (Math.random() - 0.5) * 6,
        },
        true
      )
      rigidBodyRef.current.applyTorqueImpulse(
        {
          x: (Math.random() - 0.5) * 3,
          y: Math.random() * 3,
          z: (Math.random() - 0.5) * 3,
        },
        true
      )
    }
    if (onClick) onClick(e)
  }

  const colliderType = rune.type === 'orb' ? 'ball' : 'cuboid'

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={rune.position}
      mass={rune.mass || 1.2}
      restitution={rune.restitution || 0.4}
      friction={rune.friction || 0.6}
      colliders={colliderType}
    >
      <group onPointerDown={handlePointerDown} cursor="pointer">
        {/* 1. СТАРОДАВНЯ СКРИНЯ (Ancient Chest) */}
        {rune.type === 'chest' && (
          <group scale={rune.size || 1.0}>
            {/* Корпус скрині */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.9, 0.55, 0.65]} />
              <meshStandardMaterial color="#451a03" roughness={0.7} metalness={0.2} />
            </mesh>
            {/* Закруглена кришка */}
            <mesh castShadow position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.325, 0.325, 0.9, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#361502" roughness={0.75} />
            </mesh>
            {/* Золоті металеві кутики та завіси */}
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.92, 0.1, 0.67]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.85} />
            </mesh>
            {/* Сяючий магічний замок */}
            <mesh position={[0, 0.05, 0.34]}>
              <boxGeometry args={[0.15, 0.2, 0.04]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        )}

        {/* 2. АСТРАЛЬНЕ ОКО (Astral Orb in Gyro Rings) */}
        {rune.type === 'orb' && (
          <group scale={rune.size || 1.0}>
            {/* Центральна магічна кришталева сфера */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.38, 24, 24]} />
              <meshPhysicalMaterial
                color={rune.color || '#38bdf8'}
                roughness={0.1}
                metalness={0.2}
                transmission={0.8}
                ior={1.5}
                emissive={rune.emissive || '#0284c7'}
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Зовнішнє золоте гіроскопічне кільце */}
            <mesh castShadow>
              <torusGeometry args={[0.52, 0.035, 12, 32]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Внутрішнє кільце під кутом */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.46, 0.03, 12, 32]} />
              <meshStandardMaterial color="#e0e7ff" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* 3. САБРАЛЬНА ЧАША (Celestial Chalice) */}
        {rune.type === 'chalice' && (
          <group scale={rune.size || 1.0} position={[0, -0.1, 0]}>
            {/* Підставка чаші */}
            <mesh castShadow receiveShadow position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.35, 0.42, 0.1, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Ніжка */}
            <mesh castShadow position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.35, 16]} />
              <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Чаша */}
            <mesh castShadow position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.42, 0.22, 0.45, 16]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Сяюча астральна рідина/еліксир всередині чаші */}
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
              <meshStandardMaterial
                color={rune.color || '#ec4899'}
                emissive={rune.emissive || '#be185d'}
                emissiveIntensity={1.5}
              />
            </mesh>
          </group>
        )}

        {/* 4. РУНІЧНИЙ ОБЕЛІСК (Monolith Shard) */}
        {rune.type === 'obelisk' && (
          <group scale={rune.size || 1.0}>
            {/* Гранований стовп обеліска */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.36, 1.0, 4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.65} metalness={0.35} />
            </mesh>
            {/* Золоте пірамідальне вістря (Pyramidion) */}
            <mesh castShadow position={[0, 0.65, 0]}>
              <coneGeometry args={[0.22, 0.32, 4]} />
              <meshStandardMaterial
                color="#f59e0b"
                roughness={0.2}
                metalness={0.85}
                emissive="#d97706"
                emissiveIntensity={0.6}
              />
            </mesh>
            {/* Сяючий рунічний кристал по центру */}
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial
                color={rune.color || '#10b981'}
                emissive={rune.emissive || '#059669'}
                emissiveIntensity={1.8}
              />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  )
}
