import * as THREE from 'three'

/**
 * GLSL Шейдер Небесного Порталу (Celestial Portal Shader)
 * 
 * Математична основа:
 * 1. Vertex Shader:
 *    - Моделює хвильові коливання поверхні порталу (динамічне зміщення вершин вздовж нормалі)
 *    - Використовує суперпозицію гармонік sin/cos для створення ефекту коливання мембрани простору.
 * 
 * 2. Fragment Shader:
 *    - Перетворення координат у полярну систему: r = length(uv - 0.5), theta = atan(y, x).
 *    - Завихрення (Swirl): кут обертання залежить від відстані до центру (диференціальне обертання).
 *    - Процедурний шум: генерація енергетичних кілець та плазмових спалахів.
 *    - Fresnel Effect: інтенсивне світіння по краях залежно від кута зору камери.
 *    - М'яке радіальне згасання (smoothstep) для усунення жорстких границь геометрії.
 */

export const PortalVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vElevation;

  uniform float uTime;
  uniform float uDistortion;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // Розрахунок радіальної відстані від центру диска
    float dist = length(pos.xy);

    // Хвильова деформація мембрани: комбінація радіальних хвиль та кругових збурень
    float wave1 = sin(dist * 6.0 - uTime * 2.5) * 0.12;
    float wave2 = cos(pos.x * 4.0 + uTime * 1.8) * sin(pos.y * 4.0 + uTime * 1.8) * 0.08;
    float elevation = (wave1 + wave2) * uDistortion;

    // Зміщення вздовж нормалі
    pos += normal * elevation;
    vElevation = elevation;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const PortalFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vElevation;

  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform vec3 uColorCore;
  uniform float uIntensity;
  uniform float uSpeed;

  // Псевдовипадковий процедурний шум на основі синусоїдального хешу
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // 2D Шум Перліна/Value noise для ефекту плазми
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // Hermite інтерполяція

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Фрактальний броунівський рух (Fractal Brownian Motion - FBM) для багаторівневих хвиль
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.1;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // Центрування UV координат: від [-0.5; -0.5] до [0.5; 0.5]
    vec2 centeredUv = vUv - vec2(0.5);
    float dist = length(centeredUv);

    // Радіальний відсікач: якщо піксель за межами радіуса 0.5 - відкидаємо
    if (dist > 0.5) {
      discard;
    }

    // Полярні координати
    float angle = atan(centeredUv.y, centeredUv.x);

    // Спіральне завихрення (Swirl): кут залежить від радіуса та часу
    float swirlAngle = angle + (1.0 / (dist + 0.15)) * 0.8 - uTime * uSpeed * 0.8;
    vec2 swirlCoord = vec2(cos(swirlAngle), sin(swirlAngle)) * dist;

    // Генерація процедурного шуму плазми у вихорі
    float plasma = fbm(swirlCoord * 7.0 + vec2(uTime * 0.4, -uTime * 0.6));

    // Енергетичні концентричні кільця
    float rings = sin(dist * 35.0 - uTime * 4.0 + plasma * 6.0) * 0.5 + 0.5;

    // Градієнт змішування кольорів:
    // Core (центр) -> Inner (середина) -> Outer (край)
    vec3 color = mix(uColorInner, uColorOuter, smoothstep(0.05, 0.45, dist));
    color = mix(color, uColorCore, 1.0 - smoothstep(0.0, 0.18, dist));

    // Додавання яскравості від хвиль плазми та кілець
    color += rings * 0.35 * uColorOuter;
    color += plasma * 0.4 * uColorInner;

    // Ефект Френеля (Fresnel glow) для магічного контурного сяйва
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(0.0, abs(dot(vNormal, viewDir))), 2.5);
    color += fresnel * uColorOuter * 0.8;

    // М'який альфа-перехід на зовнішньому краї порталу
    float alpha = smoothstep(0.5, 0.42, dist);

    // Підсилення загальної інтенсивності (для Bloom ефекту)
    gl_FragColor = vec4(color * uIntensity, alpha);
  }
`

/**
 * Стандартні значення параметрів (Uniforms) для порталу
 */
export const defaultPortalUniforms = {
  uTime: { value: 0 },
  uSpeed: { value: 1.2 },
  uIntensity: { value: 1.8 },
  uDistortion: { value: 1.0 },
  uColorCore: { value: new THREE.Color('#ffffff') }, // Сліпучо-біле ядро
  uColorInner: { value: new THREE.Color('#38bdf8') }, // Небесно-блакитна плазма
  uColorOuter: { value: new THREE.Color('#8b5cf6') }, // Містичний фіолетовий край
}
