import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

/**
 * FloatingIsland Component
 * 
 * Втілює вимоги:
 * 1. Примітиви: Cylinder (колони), Box (сходи, плити, вівтар), Cone (скеляста основа острова), Sphere (енергетичні кулі).
 * 2. Матеріали:
 *    - MeshStandardMaterial (стародавній камінь, золото, мармур)
 *    - MeshPhysicalMaterial (магічні кристали з transmission, ior, roughness)
 * 3. Тіні: castShadow та receiveShadow на всіх елементах.
 * 4. Фізика (Rapier): RigidBody type="fixed" для платформ, щоб спавнені предмети падали і взаємодіяли з островом.
 * 5. Анімація: м'яка левітація острова (useFrame з гармонічними синусоїдами) та обертання супутникових уламків.
 */
export function FloatingIsland() {
  const islandGroupRef = useRef()
  const crystalGroupRef = useRef()
  const satellite1Ref = useRef()
  const satellite2Ref = useRef()

  // Плавне ширяння острова в повітрі (левітація)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (islandGroupRef.current) {
      islandGroupRef.current.position.y = Math.sin(t * 0.8) * 0.25
      islandGroupRef.current.rotation.z = Math.sin(t * 0.4) * 0.015
      islandGroupRef.current.rotation.x = Math.cos(t * 0.5) * 0.01
    }

    if (crystalGroupRef.current) {
      crystalGroupRef.current.rotation.y = t * 0.5
    }

    // Обертання малих супутникових островів навколо головного
    if (satellite1Ref.current) {
      satellite1Ref.current.position.x = Math.cos(t * 0.3) * 11
      satellite1Ref.current.position.z = Math.sin(t * 0.3) * 11
      satellite1Ref.current.position.y = Math.sin(t * 0.9) * 0.4 + 1
      satellite1Ref.current.rotation.y = t * 0.2
    }

    if (satellite2Ref.current) {
      satellite2Ref.current.position.x = Math.cos(t * 0.25 + 2.5) * 13
      satellite2Ref.current.position.z = Math.sin(t * 0.25 + 2.5) * 13
      satellite2Ref.current.position.y = Math.cos(t * 0.8) * 0.5 - 1
      satellite2Ref.current.rotation.y = -t * 0.3
    }
  })

  return (
    <group ref={islandGroupRef} position={[0, 0, 0]}>
      {/* ================= ФІЗИЧНА ОСНОВА ОСТРОВА (Rapier Fixed Collider) ================= */}
      <RigidBody type="fixed" colliders="trimesh" friction={0.8} restitution={0.2}>
        <group>
          {/* Головна верхня тераса острова (Cylinder примітив) */}
          <mesh receiveShadow castShadow position={[0, -0.4, 0]}>
            <cylinderGeometry args={[8.5, 9.2, 0.8, 48]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.85}
              metalness={0.15}
            />
          </mesh>

          {/* Центральний декоративний кам'яний диск */}
          <mesh receiveShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[5.2, 5.2, 0.05, 32]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>

          {/* Внутрішній сакральний круг із золотою каймою */}
          <mesh receiveShadow position={[0, 0.06, 0]}>
            <ringGeometry args={[2.8, 3.2, 48]} />
            <meshStandardMaterial
              color="#f59e0b"
              roughness={0.2}
              metalness={0.85}
              emissive="#d97706"
              emissiveIntensity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Конічна скеляста основа острова (нижня частина) */}
          <mesh castShadow receiveShadow position={[0, -3.8, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[9.2, 6.2, 16]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.95}
              metalness={0.1}
              flatShading={true} // Підкреслює кам'яний low-poly рельєф
            />
          </mesh>

          {/* Сходи до порталу (Box примітиви) */}
          {[-4.0, -4.8, -5.6, -6.4].map((z, idx) => (
            <mesh
              key={idx}
              receiveShadow
              castShadow
              position={[0, 0.1 + idx * 0.18, z]}
            >
              <boxGeometry args={[4.2 - idx * 0.3, 0.22, 0.9]} />
              <meshStandardMaterial
                color="#475569"
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>
          ))}

          {/* Вівтар перед порталом */}
          <mesh receiveShadow castShadow position={[0, 0.9, -7.5]}>
            <boxGeometry args={[4.8, 0.4, 2.2]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ================= СТАРОДАВНІ АНТИЧНІ КОЛОНИ ТА РУЇНИ ================= */}
      {/* Ліва колонада */}
      {[-3.5, 0, 3.5].map((zPos, idx) => (
        <group key={`left-col-${idx}`} position={[-6.2, 0, zPos]}>
          <Pillar height={idx === 1 ? 4.8 : 3.8} broken={idx === 2} />
        </group>
      ))}

      {/* Права колонада */}
      {[-3.5, 0, 3.5].map((zPos, idx) => (
        <group key={`right-col-${idx}`} position={[6.2, 0, zPos]}>
          <Pillar height={idx === 0 ? 4.8 : 3.6} broken={idx === 1} />
        </group>
      ))}

      {/* Повалена зруйнована колона на землі */}
      <group position={[4.0, 0.4, 2.8]} rotation={[0.2, 0.6, 1.57]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 3.2, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} />
        </mesh>
      </group>

      {/* ================= МАГІЧНІ КРИСТАЛИ (MeshPhysicalMaterial) ================= */}
      <group ref={crystalGroupRef} position={[0, 2.4, 0]}>
        {/* Центральний ширяючий кристалічний октаедр */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.05}
            metalness={0.1}
            transmission={0.9} // Ефект прозорості та заломлення світла
            ior={1.52}         // Показник заломлення (скло/кварц)
            thickness={1.2}
            emissive="#0284c7"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Дрібні кристалічні уламки навколо */}
        {[0, 1.57, 3.14, 4.71].map((angle, i) => (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(angle) * 1.8, Math.sin(angle * 2) * 0.3, Math.sin(angle) * 1.8]}
            rotation={[angle, angle * 1.5, 0]}
          >
            <octahedronGeometry args={[0.28, 0]} />
            <meshPhysicalMaterial
              color="#a855f7"
              roughness={0.1}
              transmission={0.85}
              ior={1.6}
              emissive="#9333ea"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* ================= МАГІЧНІ ЖЕРТОВНИКИ / СМОЛОСКИПИ З ВОГНЕМ ================= */}
      <Brazier position={[-4.5, 0, -4.5]} />
      <Brazier position={[4.5, 0, -4.5]} />
      <Brazier position={[-4.5, 0, 4.5]} />
      <Brazier position={[4.5, 0, 4.5]} />

      {/* ================= СУПУТНИКОВІ ШИРЯЮЧІ УЛАМКИ ================= */}
      <group ref={satellite1Ref} position={[11, 1, 0]}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#334155" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.9} ior={1.5} emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <group ref={satellite2Ref} position={[-12, -1, 4]}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} flatShading />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Окрема колона зі стародавнім капітелем (Cylinder & Box)
 */
function Pillar({ height = 4.0, broken = false }) {
  return (
    <group>
      {/* База колони */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.4, 1.1]} />
        <meshStandardMaterial color="#475569" roughness={0.85} />
      </mesh>

      {/* Стовбур колони */}
      <mesh castShadow receiveShadow position={[0, 0.4 + height / 2, 0]}>
        <cylinderGeometry args={[0.45, 0.5, height, 24]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} metalness={0.15} />
      </mesh>

      {/* Капітель (якщо колона не поламана) */}
      {!broken && (
        <group position={[0, 0.4 + height + 0.2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.15, 0.35, 1.15]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.25, 0]}>
            <boxGeometry args={[1.3, 0.15, 1.3]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/**
 * Магічний жертовник із мерехтливим полум'ям (PointLight)
 */
function Brazier({ position }) {
  const lightRef = useRef()

  useFrame((state) => {
    if (lightRef.current) {
      // Мерехтіння вогню за допомогою випадкових коливань гармонік
      const t = state.clock.elapsedTime * 6
      const flicker = Math.sin(t) * 0.15 + Math.cos(t * 1.8) * 0.1 + 1.0
      lightRef.current.intensity = 1.6 * flicker
    }
  })

  return (
    <group position={position}>
      {/* Чаша */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.55, 0.3, 1.0, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Палаюче серце жертовника */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Світло від вогню */}
      <pointLight
        ref={lightRef}
        position={[0, 1.2, 0]}
        color="#fb923c"
        distance={8}
        decay={2}
        intensity={1.6}
        castShadow
        shadow-bias={-0.001}
      />
    </group>
  )
}

