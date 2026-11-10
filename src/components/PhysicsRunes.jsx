import React, { useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

/**
 * PhysicsRunes Component
 * 
 * Втілює вимоги:
 * 1. Фізика (Physics Engine - Rapier):
 *    - Повноцінна динамічна фізика твердих тіл (RigidBody: dynamic).
 *    - Розрахунок колізій, сили тяжіння, маси, пружності (restitution) та тертя (friction).
 *    - Застосування фізичних імпульсів (відкидання, підкидання в повітря).
 * 2. Примітиви: BoxGeometry (рунічні куби), SphereGeometry (магічні сфери), ConeGeometry (піраміди).
 * 3. Матеріали:
 *    - Золото, стародавній обсидіан, сяючий нефрит з emissive-підсвіткою.
 * 4. Тіні: кожне фізичне тіло відкидає тінь (castShadow) та приймає тіні (receiveShadow).
 */
export function PhysicsRunes({ runes = [], onRuneClick }) {
  return (
    <group>
      {runes.map((rune) => (
        <RuneItem
          key={rune.id}
          rune={rune}
          onClick={(e) => {
            e.stopPropagation()
            if (onRuneClick) onRuneClick(rune.id)
          }}
        />
      ))}
    </group>
  )
}

function RuneItem({ rune, onClick }) {
  const rigidBodyRef = useRef()

  const handlePointerDown = (e) => {
    e.stopPropagation()
    // При кліку на фізичний об'єкт надаємо йому випадковий імпульс вгору
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyImpulse(
        {
          x: (Math.random() - 0.5) * 5,
          y: Math.random() * 6 + 4,
          z: (Math.random() - 0.5) * 5,
        },
        true
      )
      rigidBodyRef.current.applyTorqueImpulse(
        {
          x: (Math.random() - 0.5) * 2,
          y: Math.random() * 2,
          z: (Math.random() - 0.5) * 2,
        },
        true
      )
    }
    if (onClick) onClick(e)
  }

  // Вибір геометричного примітиву та матеріалу відповідно до типу руни
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={rune.position}
      mass={rune.mass || 1.2}
      restitution={rune.restitution || 0.4} // Пружність відскоку
      friction={rune.friction || 0.6}       // Сила тертя
      colliders={rune.type === 'sphere' ? 'ball' : 'cuboid'}
    >
      <group onPointerDown={handlePointerDown} cursor="pointer">
        {rune.type === 'cube' && (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[rune.size || 0.7, rune.size || 0.7, rune.size || 0.7]} />
            <meshStandardMaterial
              color={rune.color || '#3b82f6'}
              roughness={0.3}
              metalness={0.7}
              emissive={rune.emissive || '#1d4ed8'}
              emissiveIntensity={0.4}
            />
          </mesh>
        )}

        {rune.type === 'sphere' && (
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[(rune.size || 0.7) * 0.55, 24, 24]} />
            <meshStandardMaterial
              color={rune.color || '#ec4899'}
              roughness={0.15}
              metalness={0.85}
              emissive={rune.emissive || '#be185d'}
              emissiveIntensity={0.6}
            />
          </mesh>
        )}

        {rune.type === 'pyramid' && (
          <mesh castShadow receiveShadow>
            <coneGeometry args={[(rune.size || 0.7) * 0.6, rune.size || 0.8, 4]} />
            <meshStandardMaterial
              color={rune.color || '#eab308'}
              roughness={0.25}
              metalness={0.8}
              emissive={rune.emissive || '#ca8a04'}
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </RigidBody>
  )
}
