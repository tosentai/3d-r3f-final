import React from 'react'
import { EffectComposer, Bloom, Vignette, ToneMapping, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * PostProcessingEffects Component
 * 
 * Втілює вимоги:
 * 1. Максимально якісно налаштований рендер:
 *    - Bloom: вибіркове розсіювання яскравих пікселів (неонові руни, ядро порталу, вогонь у жертовниках).
 *    - Vignette: оптичне затемнення країв кадру для кінематографічного фокусування на центрі святилища.
 *    - ToneMapping (ACES Filmic): професійна кінокорекція кольорів, що запобігає перепаленим білим пікселям.
 *    - ChromaticAberration: тонке лінзове розщеплення спектра для відчуття високої магії/квантової аномалії.
 */
export function PostProcessingEffects({
  enableBloom = true,
  enableVignette = true,
  enableChromatic = false,
  bloomIntensity = 1.2
}) {
  return (
    <EffectComposer disableNormalPass multisampling={4}>
      {/* 1. Світіння (Bloom) */}
      {enableBloom && (
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.3}
          mipmapBlur={true}
          intensity={bloomIntensity}
        />
      )}

      {/* 2. Віньєтка (Vignette) */}
      {enableVignette && (
        <Vignette
          offset={0.2}
          darkness={0.75}
        />
      )}

      {/* 3. Хроматична аберація (опціонально для перевантаження порталу) */}
      {enableChromatic && (
        <ChromaticAberration
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}

      {/* 4. Tone Mapping */}
      <ToneMapping />
    </EffectComposer>
  )
}
