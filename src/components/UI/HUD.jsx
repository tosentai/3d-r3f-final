import React, { useState, useEffect } from 'react'
import {
  Sun, Moon, Sunset, Sparkles, Orbit, RotateCcw,
  Info, Shield, Zap, Box, Circle, Disc,
  Eye, Cpu, Layers, Trophy, Flame
} from 'lucide-react'

export function HUD({
  timeOfDay,
  setTimeOfDay,
  gravityPreset,
  setGravityPreset,
  onSpawnRune,
  onClearRunes,
  runeCount,
  portalSpeed,
  setPortalSpeed,
  portalIntensity,
  setPortalIntensity,
  activeCameraPreset,
  setCameraPreset,
  portalNotification
}) {
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [fps, setFps] = useState(60)

  // Простий лічильник кадрів (FPS)
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const updateFps = () => {
      frameCount++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)))
        frameCount = 0
        lastTime = now
      }
      requestAnimationFrame(updateFps)
    }

    const handle = requestAnimationFrame(updateFps)
    return () => cancelAnimationFrame(handle)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 md:p-6 text-white select-none">
      {/* ================= ВЕРХНІЙ БАР ================= */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Логотип та Назва Проекту */}
          <div className="pointer-events-auto glass-panel rounded-2xl px-5 py-3 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-wider bg-gradient-to-r from-amber-200 via-sky-200 to-purple-200 bg-clip-text text-transparent">
                CELESTIAL SANCTUARY
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Three.js / React Three Fiber</span>
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                <span className="text-emerald-400 font-medium">Rapier WASM Physics</span>
              </p>
            </div>
          </div>

          {/* Метрики та Кнопка Інформації */}
          <div className="pointer-events-auto flex items-center gap-3">
            {/* FPS та Статистика */}
            <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">FPS:</span>
                <span className={`font-bold ${fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                  {fps}
                </span>
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Предметів:</span>
                <span className="font-bold text-sky-400">{runeCount}</span>
              </div>
            </div>

            {/* Кнопка "Довідка для Захисту" */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="glass-panel hover:bg-white/15 active:scale-95 transition-all rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-amber-300 border-amber-500/30 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Критерії Проекту</span>
            </button>
          </div>
        </div>

        {/* Спливаюче сповіщення про активацію порталу */}
        {portalNotification && (
          <div className="self-center pointer-events-auto glass-panel border-sky-400/50 bg-sky-950/70 text-sky-200 px-5 py-2.5 rounded-full text-xs font-medium shadow-xl shadow-sky-500/20 animate-bounce flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>{portalNotification}</span>
          </div>
        )}
      </header>

      {/* ================= НИЖНЯ ПАНЕЛЬ КЕРУВАННЯ ================= */}
      <footer className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
        {/* Панель інструментів */}
        <div className="pointer-events-auto glass-panel rounded-3xl p-3 md:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          {/* 1. Спавн реальних предметів */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
              Спавн:
            </span>
            <button
              onClick={() => onSpawnRune('chest')}
              className="glass-pill rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-white"
              title="Спавнити стародавню рунічну скриню"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Скриня</span>
            </button>
            <button
              onClick={() => onSpawnRune('orb')}
              className="glass-pill rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-sky-300 hover:text-white"
              title="Спавнити астральну сферу"
            >
              <Circle className="w-3.5 h-3.5 text-sky-400" />
              <span>Сфера</span>
            </button>
            <button
              onClick={() => onSpawnRune('chalice')}
              className="glass-pill rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-pink-300 hover:text-white"
              title="Спавнити сакральну чашу"
            >
              <Trophy className="w-3.5 h-3.5 text-pink-400" />
              <span>Чаша</span>
            </button>
            <button
              onClick={() => onSpawnRune('obelisk')}
              className="glass-pill rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-white"
              title="Спавнити рунічний обеліск"
            >
              <Disc className="w-3.5 h-3.5 text-emerald-400" />
              <span>Обеліск</span>
            </button>
            {runeCount > 0 && (
              <button
                onClick={onClearRunes}
                className="glass-pill rounded-xl px-2.5 py-1.5 text-xs text-red-400 hover:text-red-200"
                title="Очистити спавнені предмети"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Гравітаційний режим (Rapier Physics) */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
              Гравітація:
            </span>
            {[
              { id: 'earth', label: '1.0G (Норма)', icon: Zap },
              { id: 'moon', label: '0.2G (Місяць)', icon: Orbit },
              { id: 'zero', label: 'Антигравітація', icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setGravityPreset(id)}
                className={`rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition-all ${
                  gravityPreset === id
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* 3. Освітлення / Час доби */}
          <div className="flex items-center gap-1 bg-black/30 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'noon', icon: Sun, label: 'День' },
              { id: 'sunset', icon: Sunset, label: 'Захід' },
              { id: 'night', icon: Moon, label: 'Ніч' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTimeOfDay(id)}
                className={`rounded-xl p-2 flex items-center gap-1.5 text-xs font-medium transition-all ${
                  timeOfDay === id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* 4. Ракурси камери */}
          <div className="flex items-center gap-1 bg-black/30 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'default', label: 'Огляд' },
              { id: 'portal', label: 'Портал' },
              { id: 'monolith', label: 'Вівтар' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCameraPreset(id)}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                  activeCameraPreset === id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Підказка щодо керування та інтерактивності */}
        <p className="text-center text-[11px] text-slate-400 tracking-wide">
          ✨ <strong className="text-sky-300">Клікніть ЛКМ прямо по порталу</strong> для активації ударної хвилі • ЛКМ по предметах: поштовх • Обертайте і зумте камеру без обмежень!
        </p>
      </footer>

      {/* ================= МОДАЛЬНЕ ВІКНО: ДОВІДКА ДЛЯ ЗАХИСТУ ================= */}
      {showInfoModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel border-white/20 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">
                  Звіт реалізації вимог проекту
                </h2>
                <p className="text-xs text-slate-400">
                  Готові відповіді для захисту перед викладачем
                </p>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Checklist of all university requirements */}
            <div className="space-y-4 text-xs md:text-sm">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-sky-300 flex items-center gap-2">
                  <Box className="w-4 h-4 text-sky-400" />
                  1. Примітиви (Primitives)
                </div>
                <p className="text-slate-300">
                  Використано геометричні примітиви Three.js: <code>CylinderGeometry</code> (античні колони, тераса, основа скрині та чаш), <code>BoxGeometry</code> (сходи, постаменти, корпус скрині), <code>ConeGeometry</code> (скеляста основа острова, вістря обелісків), <code>SphereGeometry</code> (астральні сфери, полум'я), <code>TorusGeometry</code> (орбітальні сакральні кільця порталу та реліквії), <code>OctahedronGeometry</code> (ширяючі кристали).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-purple-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  2. Складні моделі (Complex Models)
                </div>
                <p className="text-slate-300">
                  Інтегровано GLTF/GLB модель високої полігональності <code>celestial-relic.glb</code> (PBR metallic-roughness workflow, normal/occlusion maps, 3.59 MB) через хук <code>useGLTF</code> з оптимізованим попереднім завантаженням (<code>preload</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  3. Матеріали (Materials)
                </div>
                <p className="text-slate-300">
                  PBR матеріали <code>MeshStandardMaterial</code> (metalness/roughness для каменя, золота, деревини скринь), <code>MeshPhysicalMaterial</code> для астральних сфер і кристалів (із <code>transmission=0.85</code>, <code>ior=1.52</code>, <code>thickness</code> для оптичного заломлення світла) та <code>emissive</code> матеріали зі світінням.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-yellow-300 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  4. Освітлення та Тіні (Lighting & Shadows)
                </div>
                <p className="text-slate-300">
                  Комбінація: <code>DirectionalLight</code> (збалансоване сонце з картою тіней 2048x2048, <code>shadow-bias=-0.00015</code>, <code>shadow-normalBias=0.02</code>); <code>HemisphereLight</code>; локальні <code>PointLight</code> з мерехтінням; м'які контактні тіні <code>ContactShadows</code> під островом.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  5. Фізика (Physics - Rapier)
                </div>
                <p className="text-slate-300">
                  WebAssembly-двигун <code>@react-three/rapier</code>: тераса острова має статичний колайдер <code>type="fixed"</code>; рунічні скрині, астральні сфери, чаші та обеліски мають динамічну масу, пружність та тертя. Реалізовано зміну гравітації, поштовхи при кліку миші та ударну хвилю порталу.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-cyan-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  6. Кастомний GLSL Шейдер (Shader)
                </div>
                <p className="text-slate-300">
                  Власний GLSL шейдер: <strong>Vertex Shader</strong> деформує мембрану порталу тригонометричними хвилями вздовж нормалей; <strong>Fragment Shader</strong> реалізує полярні координати, спіральний вихор (Swirl), FBM-шум, кільця та кутове світіння Френеля (Fresnel). Інтерактивно реагує на клік ЛКМ.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-semibold text-rose-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-rose-400" />
                  7. Високоякісний рендер (Render & Postprocessing)
                </div>
                <p className="text-slate-300">
                  Рендерер <code>ACESFilmicToneMapping</code>, <code>outputColorSpace=SRGBColorSpace</code>. Пост-процесинг з вибірковим <code>Bloom</code> (поріг 0.82 запобігає пересвіту неба), <code>Vignette</code> та хроматичною аберацією.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                Зрозуміло, повернутися до сцени
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
