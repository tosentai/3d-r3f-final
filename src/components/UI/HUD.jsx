import React, { useState, useEffect } from 'react'
import {
  Sun, Moon, Sunset, Sparkles, Orbit, RotateCcw,
  Zap, Box, Circle, Disc, Trophy
} from 'lucide-react'

export function HUD({
  timeOfDay,
  setTimeOfDay,
  gravityPreset,
  setGravityPreset,
  onSpawnRune,
  onClearRunes,
  runeCount,
  activeCameraPreset,
  setCameraPreset,
  portalNotification
}) {
  const [fps, setFps] = useState(60)

  // Лічильник кадрів (FPS)
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
      {/* ================= ВЕРХНІЙ БАР: ЛІЧИЛЬНИК ТА СПОВІЩЕННЯ ================= */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-end">
          {/* FPS та Лічильник предметів */}
          <div className="pointer-events-auto glass-panel rounded-2xl px-4 py-2 flex items-center gap-4 text-xs font-mono shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">FPS:</span>
              <span
                className={`font-bold ${
                  fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400'
                }`}
              >
                {fps}
              </span>
            </div>
            <div className="w-[1px] h-3.5 bg-white/15" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Предметів:</span>
              <span className="font-bold text-sky-400">{runeCount}</span>
            </div>
          </div>
        </div>

        {/* Спливаюче сповіщення при активації порталу */}
        {portalNotification && (
          <div className="self-center pointer-events-auto glass-panel border-sky-400/50 bg-sky-950/75 text-sky-200 px-5 py-2.5 rounded-full text-xs font-medium shadow-xl shadow-sky-500/20 animate-bounce flex items-center gap-2">
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
          ✨ <strong className="text-sky-300">Клікніть ЛКМ прямо по порталу</strong> для активації ударної хвилі та випуску артефакту • Клік по предметах: поштовх
        </p>
      </footer>
    </div>
  )
}
