import React from 'react'
import { EffectComposer, Bloom, Vignette, ToneMapping, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * PostProcessingEffects Component
 * 
 * Налаштування:
 * - luminanceThreshold={0.82} гарантує, що світяться виключно яскраві руни,
 *   портал та вогонь, а небосхил залишається чистим і не сліпить.
 */
export function PostProcessingEffects({
  enableBloom = true,
  enableVignette = true,
  enableChromatic = false,
  bloomIntensity = 0.8
}) {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      {/* 1. М'яке вибіркове світіння (Bloom) */}
      {enableBloom && (
        <Bloom
          luminanceThreshold={0.82}
          luminanceSmoothing={0.2}
          mipmapBlur={true}
          intensity={bloomIntensity}
        />
      )}

      {/* 2. Кінематографічна віньєтка */}
      {enableVignette && (
        <Vignette
          offset={0.25}
          darkness={0.7}
        />
      )}

      {/* 3. Хроматична аберація */}
      {enableChromatic && (
        <ChromaticAberration
          offset={new THREE.Vector2(0.0015, 0.0015)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}

      {/* 4. Tone Mapping */}
      <ToneMapping />
    </EffectComposer>
  )
}
