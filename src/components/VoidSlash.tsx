import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SLASHES = [
  { x1: 2, y1: 22, x2: 78, y2: 12, width: 1.2 },
  { x1: 15, y1: 58, x2: 92, y2: 44, width: 1.0 },
  { x1: 28, y1: 5, x2: 98, y2: 68, width: 1.5 },
  { x1: 0, y1: 78, x2: 65, y2: 30, width: 0.8 },
  { x1: 42, y1: 92, x2: 100, y2: 18, width: 1.1 },
  { x1: 55, y1: 2, x2: 10, y2: 85, width: 0.7 },
  { x1: 80, y1: 70, x2: 20, y2: 40, width: 1.3 },
  { x1: 5, y1: 45, x2: 95, y2: 52, width: 0.9 },
  { x1: 60, y1: 10, x2: 35, y2: 90, width: 1.0 },
  { x1: 18, y1: 80, x2: 88, y2: 25, width: 0.8 },
  { x1: 72, y1: 35, x2: 8, y2: 65, width: 1.2 },
  { x1: 45, y1: 0, x2: 55, y2: 100, width: 0.6 },
  { x1: 0, y1: 55, x2: 100, y2: 42, width: 1.4 },
  { x1: 90, y1: 88, x2: 12, y2: 15, width: 0.9 },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function cloneRealityLayer(hero: HTMLDivElement, x: number, y: number, vw: number, vh: number) {
  const layer = hero.cloneNode(true) as HTMLDivElement
  layer.removeAttribute('id')
  layer.classList.add('void-fragment-reality')
  layer.style.position = 'absolute'
  layer.style.inset = 'auto'
  layer.style.left = `${-x}px`
  layer.style.top = `${-y}px`
  layer.style.width = `${vw}px`
  layer.style.height = `${vh}px`
  layer.style.display = 'flex'
  layer.style.opacity = '1'
  layer.style.pointerEvents = 'none'
  layer.style.transform = 'none'
  layer.style.transformOrigin = '50% 50%'
  layer.style.filter = 'saturate(0.25) contrast(2.8) brightness(0.62)'
  return layer
}

function spawnFragments(hero: HTMLDivElement, container: HTMLDivElement, tl: gsap.core.Timeline) {
  container.innerHTML = ''
  const vw = window.innerWidth
  const vh = window.innerHeight

  for (let i = 0; i < 64; i++) {
    const el = document.createElement('div')
    el.className = 'void-fragment'

    const cx = vw * (0.03 + Math.random() * 0.94)
    const cy = vh * (0.03 + Math.random() * 0.94)

    const rng = Math.random()
    let sides: number, baseR: number, sliverScale: number

    if (rng < 0.22) {
      sides = 3
      baseR = 52 + Math.random() * 96
      sliverScale = 1.2 + Math.random() * 1.3
    } else if (rng < 0.42) {
      sides = 3
      baseR = 24 + Math.random() * 44
      sliverScale = 7 + Math.random() * 9
    } else if (rng < 0.72) {
      sides = 4 + Math.floor(Math.random() * 2)
      baseR = 74 + Math.random() * 120
      sliverScale = 1.4 + Math.random() * 1.8
    } else {
      sides = 5 + Math.floor(Math.random() * 3)
      baseR = 130 + Math.random() * 180
      sliverScale = 1.1 + Math.random() * 0.9
    }

    const ao = Math.random() * Math.PI * 2
    const sd = Math.random() * Math.PI
    const screenPts = Array.from({ length: sides }, (_, j) => {
      const a = (j / sides) * Math.PI * 2 + ao + (Math.random() - 0.5) * 1.3
      const r = baseR * (0.45 + Math.random() * 0.9)
      const sx = sliverScale > 1 ? sliverScale * Math.abs(Math.cos(sd)) + 1 : 1
      const sy = sliverScale > 1 ? sliverScale * Math.abs(Math.sin(sd)) + 1 : 1
      return {
        x: clamp(cx + Math.cos(a) * r * sx, -vw * 0.08, vw * 1.08),
        y: clamp(cy + Math.sin(a) * r * sy, -vh * 0.08, vh * 1.08),
      }
    })

    const minX = clamp(Math.min(...screenPts.map((p) => p.x)), -vw * 0.08, vw)
    const minY = clamp(Math.min(...screenPts.map((p) => p.y)), -vh * 0.08, vh)
    const maxX = clamp(Math.max(...screenPts.map((p) => p.x)), 0, vw * 1.08)
    const maxY = clamp(Math.max(...screenPts.map((p) => p.y)), 0, vh * 1.08)
    const w = Math.max(16, maxX - minX)
    const h = Math.max(16, maxY - minY)
    const localPts = screenPts.map((p) => `${p.x - minX}px ${p.y - minY}px`)

    const baseLayer = cloneRealityLayer(hero, minX, minY, vw, vh)
    const cyanLayer = cloneRealityLayer(hero, minX, minY, vw, vh)
    const redLayer = cloneRealityLayer(hero, minX, minY, vw, vh)
    cyanLayer.classList.add('void-fragment-reality--cyan')
    redLayer.classList.add('void-fragment-reality--red')
    el.append(baseLayer, cyanLayer, redLayer)

    const normX = cx / vw - 0.5
    const normY = cy / vh - 0.5
    const dist = Math.sqrt(normX * normX + normY * normY)
    const angle = Math.atan2(normY, normX) + (Math.random() - 0.5) * 0.55
    const isNear = Math.random() > 0.5
    const speed = 820 + dist * 2600 + Math.random() * 980
    const dx = Math.cos(angle) * speed * (0.72 + Math.random() * 0.7)
    const dy = Math.sin(angle) * speed * (0.72 + Math.random() * 0.7)
    const dz = isNear ? 950 + Math.random() * 1650 : -(900 + Math.random() * 1900)
    const rz = (Math.random() - 0.5) * 1080
    const rx = (Math.random() - 0.5) * 720
    const ry = (Math.random() - 0.5) * 780
    const stagger = Math.min(0.022, dist * 0.016 + Math.random() * 0.012)

    const gc = isNear ? 'rgba(0,180,255,0.95)' : 'rgba(130,60,255,0.85)'
    const gs = isNear ? 28 : 18

    el.style.cssText = `
      position:absolute;
      left:${minX}px;
      top:${minY}px;
      width:${w}px;
      height:${h}px;
      overflow:hidden;
      clip-path:polygon(${localPts.join(',')});
      filter:drop-shadow(0 0 ${gs}px ${gc}) drop-shadow(0 0 3px rgba(255,255,255,0.35));
      transform-origin:${cx - minX}px ${cy - minY}px;
      will-change:transform,opacity;
    `
    container.appendChild(el)

    tl.fromTo(
      el,
      {
        x: 0,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        opacity: 1,
        scale: 1,
      },
      {
        x: dx,
        y: dy,
        z: dz,
        rotationZ: rz,
        rotationX: rx,
        rotationY: ry,
        scale: isNear ? 1.35 + Math.random() * 0.85 : 0.18 + Math.random() * 0.34,
        opacity: 0,
        filter: `blur(${isNear ? 10 : 18}px) drop-shadow(0 0 64px ${gc})`,
        duration: 0.048 + Math.random() * 0.026,
        ease: Math.random() > 0.5 ? 'expo.inOut' : 'back.out(1.55)',
      },
      0.9 + stagger,
    )

    tl.to(
      [cyanLayer, redLayer],
      {
        x: (_index, target: HTMLElement) =>
          target.classList.contains('void-fragment-reality--cyan') ? 8 : -8,
        opacity: 0.28,
        duration: 0.045,
        yoyo: true,
        repeat: 1,
        ease: 'expo.inOut',
      },
      0.9 + stagger,
    )
  }
}

function injectParticleExplosion(container: HTMLDivElement, tl: gsap.core.Timeline) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const centerX = vw / 2
  const centerY = vh / 2

  container.querySelectorAll('.void-particle-shard').forEach((node) => node.remove())

  for (let i = 0; i < 40; i++) {
    const shard = document.createElement('div')
    const size = 14 + Math.random() * 54
    const aspect = 0.35 + Math.random() * 2.2
    const startX = centerX + (Math.random() - 0.5) * vw * 0.18
    const startY = centerY + (Math.random() - 0.5) * vh * 0.14
    const angle = Math.atan2(startY - centerY, startX - centerX) + (Math.random() - 0.5) * 1.2
    const travel = 260 + Math.random() * 980
    const zFlight = 650 + Math.random() * 1150

    shard.className = 'void-particle-shard'
    shard.style.cssText = `
      position:absolute;
      left:${startX}px;
      top:${startY}px;
      width:${size * aspect}px;
      height:${size}px;
      pointer-events:none;
      opacity:0;
      clip-path:polygon(${Math.random() * 18}% 0%,100% ${10 + Math.random() * 28}%,${80 + Math.random() * 18}% 100%,0% ${60 + Math.random() * 30}%);
      background:linear-gradient(135deg,rgba(255,255,255,0.86),rgba(170,225,255,0.34) 44%,rgba(255,255,255,0.12));
      border:1px solid rgba(255,255,255,0.58);
      box-shadow:0 0 26px rgba(110,205,255,0.62), inset 0 0 20px rgba(255,255,255,0.34);
      backdrop-filter:blur(14px) saturate(1.4);
      -webkit-backdrop-filter:blur(14px) saturate(1.4);
      transform-style:preserve-3d;
      backface-visibility:hidden;
      will-change:transform,opacity,filter;
    `
    container.appendChild(shard)

    const start = 0.898 + Math.random() * 0.018
    const duration = 0.052 + Math.random() * 0.03

    tl.fromTo(
      shard,
      {
        x: 0,
        y: 0,
        z: 0,
        scale: 0.15 + Math.random() * 0.35,
        opacity: 0.95,
        rotationX: 0,
        rotationY: 0,
        rotationZ: Math.random() * 90,
        filter: 'blur(0px) brightness(1.4)',
      },
      {
        x: Math.cos(angle) * travel + (Math.random() - 0.5) * 260,
        y: Math.sin(angle) * travel + (Math.random() - 0.5) * 220,
        z: zFlight,
        scale: 1.1 + Math.random() * 1.8,
        opacity: 0,
        rotationX: (Math.random() - 0.5) * 1080,
        rotationY: (Math.random() - 0.5) * 1080,
        rotationZ: (Math.random() - 0.5) * 1440,
        filter: 'blur(10px) brightness(2.2)',
        duration,
        ease: Math.random() > 0.5 ? 'expo.inOut' : 'back.out(1.7)',
        onComplete: () => {
          shard.remove()
        },
      },
      start,
    )
  }
}

function spawnAftermathShards(container: HTMLDivElement) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const centerX = vw / 2
  const centerY = vh / 2
  const shards = 36

  container.querySelectorAll('.void-aftermath-shard').forEach((node) => node.remove())

  for (let i = 0; i < shards; i++) {
    const shard = document.createElement('div')
    const size = 10 + Math.random() * 46
    const startX = centerX + (Math.random() - 0.5) * vw * 0.42
    const startY = centerY + (Math.random() - 0.5) * vh * 0.28
    const angle = Math.atan2(startY - centerY, startX - centerX) + (Math.random() - 0.5) * 0.9
    const travel = 180 + Math.random() * 760

    shard.className = 'void-aftermath-shard'
    shard.style.cssText = `
      position:absolute;
      left:${startX}px;
      top:${startY}px;
      width:${size * (0.45 + Math.random() * 1.9)}px;
      height:${size}px;
      pointer-events:none;
      opacity:0;
      clip-path:polygon(${Math.random() * 24}% 0%,100% ${12 + Math.random() * 34}%,${72 + Math.random() * 24}% 100%,0% ${54 + Math.random() * 36}%);
      background:linear-gradient(135deg,rgba(255,255,255,0.7),rgba(145,220,255,0.24) 48%,rgba(255,255,255,0.08));
      border:1px solid rgba(255,255,255,0.36);
      box-shadow:0 0 24px rgba(95,190,255,0.42), inset 0 0 18px rgba(255,255,255,0.22);
      backdrop-filter:blur(12px) saturate(1.35);
      -webkit-backdrop-filter:blur(12px) saturate(1.35);
      transform-style:preserve-3d;
      backface-visibility:hidden;
      will-change:transform,opacity,filter;
    `
    container.appendChild(shard)

    gsap.fromTo(
      shard,
      {
        x: 0,
        y: 0,
        z: 320 + Math.random() * 720,
        scale: 0.45 + Math.random() * 0.5,
        opacity: 0.78,
        rotationX: (Math.random() - 0.5) * 220,
        rotationY: (Math.random() - 0.5) * 220,
        rotationZ: (Math.random() - 0.5) * 260,
        filter: 'blur(0px) brightness(1.5)',
      },
      {
        x: Math.cos(angle) * travel + (Math.random() - 0.5) * 260,
        y: Math.sin(angle) * travel + 120 + Math.random() * 280,
        z: 980 + Math.random() * 1250,
        scale: 0.25 + Math.random() * 0.7,
        opacity: 0,
        rotationX: (Math.random() - 0.5) * 900,
        rotationY: (Math.random() - 0.5) * 900,
        rotationZ: (Math.random() - 0.5) * 1180,
        filter: 'blur(12px) brightness(1.9)',
        duration: 1.15 + Math.random() * 0.65,
        ease: 'power4.out',
        onComplete: () => shard.remove(),
      },
    )
  }
}

function continueSpatialFragments(container: HTMLDivElement) {
  const fragments = Array.from(container.querySelectorAll<HTMLElement>('.void-fragment'))
  if (fragments.length === 0) return

  fragments.forEach((fragment, index) => {
    if (index % 2 === 1) return

    gsap.killTweensOf(fragment)
    gsap.set(fragment, {
      opacity: 0.72,
      filter: 'blur(0px) drop-shadow(0 0 32px rgba(70,180,255,0.72))',
      pointerEvents: 'none',
      willChange: 'transform,opacity,filter',
    })

    gsap.to(fragment, {
      x: `+=${(Math.random() - 0.5) * 760}`,
      y: `+=${160 + Math.random() * 620}`,
      z: `+=${500 + Math.random() * 1500}`,
      rotationX: `+=${(Math.random() - 0.5) * 720}`,
      rotationY: `+=${(Math.random() - 0.5) * 720}`,
      rotationZ: `+=${(Math.random() - 0.5) * 900}`,
      scale: 0.22 + Math.random() * 0.62,
      opacity: 0,
      filter: 'blur(18px) drop-shadow(0 0 54px rgba(70,180,255,0.24))',
      duration: 1.25 + Math.random() * 0.8,
      ease: 'power4.out',
    })
  })
}

function spawnCarryoverSpatialFragments(container: HTMLDivElement) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  container.querySelectorAll('.void-carry-fragment').forEach((node) => node.remove())

  for (let i = 0; i < 30; i++) {
    const fragment = document.createElement('div')
    const w = 90 + Math.random() * 260
    const h = 70 + Math.random() * 220
    const x = Math.random() * (vw - w)
    const y = Math.random() * (vh - h)
    const p1 = 4 + Math.random() * 24
    const p3 = 76 + Math.random() * 22
    const p4 = 8 + Math.random() * 30
    const isNear = Math.random() > 0.45

    fragment.className = 'void-carry-fragment'
    fragment.style.cssText = `
      position:absolute;
      left:${x}px;
      top:${y}px;
      width:${w}px;
      height:${h}px;
      pointer-events:none;
      opacity:0;
      clip-path:polygon(${p1}% 0%,100% ${8 + Math.random() * 28}%,${p3}% 100%,0% ${p4}%);
      background:
        linear-gradient(135deg,rgba(255,255,255,0.42),rgba(104,202,255,0.18) 42%,rgba(5,18,45,0.22)),
        radial-gradient(circle at 35% 25%,rgba(255,255,255,0.32),transparent 42%);
      border:1px solid rgba(170,230,255,0.36);
      box-shadow:
        0 0 34px rgba(40,165,255,0.42),
        inset 0 0 28px rgba(255,255,255,0.18);
      backdrop-filter:blur(10px) saturate(1.35);
      -webkit-backdrop-filter:blur(10px) saturate(1.35);
      mix-blend-mode:screen;
      transform-style:preserve-3d;
      backface-visibility:hidden;
      will-change:transform,opacity,filter;
    `
    container.appendChild(fragment)

    gsap.fromTo(
      fragment,
      {
        x: 0,
        y: 0,
        z: isNear ? 120 + Math.random() * 380 : -(80 + Math.random() * 260),
        scale: 0.75 + Math.random() * 0.55,
        opacity: 0.72,
        rotationX: (Math.random() - 0.5) * 140,
        rotationY: (Math.random() - 0.5) * 140,
        rotationZ: (Math.random() - 0.5) * 160,
        filter: 'blur(0px) brightness(1.45)',
      },
      {
        x: (Math.random() - 0.5) * 980,
        y: 180 + Math.random() * 760,
        z: isNear ? 900 + Math.random() * 1500 : -(620 + Math.random() * 1200),
        scale: isNear ? 1.2 + Math.random() * 1.1 : 0.18 + Math.random() * 0.36,
        opacity: 0,
        rotationX: (Math.random() - 0.5) * 980,
        rotationY: (Math.random() - 0.5) * 980,
        rotationZ: (Math.random() - 0.5) * 1260,
        filter: 'blur(16px) brightness(1.8)',
        duration: 1.45 + Math.random() * 0.85,
        ease: 'power4.out',
        onComplete: () => fragment.remove(),
      },
    )
  }
}

export function VoidSlash({
  heroRef,
  spacerRef,
  contentRef,
}: {
  heroRef: React.RefObject<HTMLDivElement | null>
  spacerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const coldRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)
  const aberrRef = useRef<HTMLDivElement>(null)
  const slashesRef = useRef<HTMLDivElement>(null)
  const afterglowRef = useRef<HTMLDivElement>(null)
  const fragRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const crosshairRef = useRef<HTMLDivElement>(null)
  const capturedRef = useRef(false)
  const releaseRef = useRef<gsap.core.Tween | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const buildFragments = useCallback(() => {
    if (capturedRef.current || !heroRef.current || !fragRef.current || !tlRef.current) return
    capturedRef.current = true
    spawnFragments(heroRef.current, fragRef.current, tlRef.current)
    injectParticleExplosion(fragRef.current, tlRef.current)
  }, [heroRef])

  useEffect(() => {
    const hero = heroRef.current
    const spacer = spacerRef.current
    const content = contentRef?.current
    const wrap = wrapRef.current
    if (!hero || !spacer || !wrap) return
    if (!coldRef.current || !vignetteRef.current || !aberrRef.current) return
    if (!slashesRef.current || !afterglowRef.current || !fragRef.current) return
    if (!flashRef.current || !crosshairRef.current) return

    const cold = coldRef.current
    const vignette = vignetteRef.current
    const aberr = aberrRef.current
    const slashWrap = slashesRef.current
    const afterglow = afterglowRef.current
    const frags = fragRef.current
    const flash = flashRef.current
    const crosshair = crosshairRef.current
    if (content)
      gsap.set(content, {
        position: 'fixed',
        inset: 0,
        opacity: 0,
        scale: 0.9,
        filter: 'blur(28px)',
        overflow: 'hidden',
        pointerEvents: 'none',
        transformOrigin: '50% 50%',
      })

    const tl = gsap.timeline({ paused: true })
    tlRef.current = tl
    gsap.set(hero, {
      transformPerspective: 1400,
      transformStyle: 'preserve-3d',
      transformOrigin: '50% 50%',
    })
    gsap.set(frags, { scale: 1, transformOrigin: '50% 50%' })

    // ── [0.00–0.80] QUIET ────────────────────────────────────────────────────
    tl.to(
      hero,
      {
        scale: 1.1,
        z: -90,
        transformPerspective: 430,
        filter: 'saturate(0.06) contrast(3.2) brightness(0.48)',
        duration: 0.3,
        ease: 'expo.inOut',
      },
      0,
    )
    tl.to(hero, { scale: 1.18, z: -130, duration: 0.5, ease: 'power2.inOut' }, 0.3)
    tl.to(vignette, { opacity: 1, duration: 0.8, ease: 'power2.in' }, 0)
    tl.to(cold, { opacity: 0.7, duration: 0.8, ease: 'power1.in' }, 0)

    const shakeKFs: [number, number, number][] = [
      [0.04, -22, 16],
      [0.1, 18, -14],
      [0.17, -26, 11],
      [0.24, 20, -18],
      [0.31, -12, 13],
      [0.38, 16, -9],
      [0.45, -10, 11],
    ]
    shakeKFs.forEach(([t, x, y], i) =>
      tl.to(
        hero,
        {
          x,
          y,
          rotationZ: i % 2 === 0 ? -0.35 : 0.32,
          duration: 0.06,
          ease: 'sine.inOut',
        },
        t,
      ),
    )
    tl.to(hero, { x: 0, y: 0, rotationZ: 0, duration: 0.07, ease: 'power2.out' }, 0.52)

    // ── [0.30–0.75] SLASHES ──────────────────────────────────────────────────
    const slashEls = slashWrap.querySelectorAll<HTMLElement>('.void-slash-line')
    slashEls.forEach((el, i) => {
      const t = 0.3 + i * 0.032
      tl.fromTo(
        el,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.04, ease: 'expo.out' },
        t,
      )
      const flashIntensity = 0.18 + i * 0.015
      tl.to(flash, { opacity: flashIntensity, duration: 0.012, ease: 'none' }, t)
      tl.to(flash, { opacity: 0, duration: 0.088, ease: 'expo.out' }, t + 0.012)
      const aberrIntensity = 0.3 + i * 0.04
      tl.to(aberr, { opacity: aberrIntensity, duration: 0.012, ease: 'none' }, t)
      tl.to(aberr, { opacity: 0, duration: 0.088, ease: 'expo.out' }, t + 0.012)
      const shakeRange = 4 + i * 1.5
      const sx = (Math.random() - 0.5) * shakeRange
      const sy = (Math.random() - 0.5) * shakeRange
      tl.to(slashWrap, { x: sx, y: sy, duration: 0.018, ease: 'none' }, t)
      tl.to(slashWrap, { x: 0, y: 0, duration: 0.022, ease: 'power2.out' }, t + 0.018)
      const ghost = el.nextElementSibling as HTMLElement | null
      if (ghost)
        tl.fromTo(
          ghost,
          { scaleX: 0, opacity: 0, x: 0 },
          { scaleX: 1, opacity: 0.3, x: 8, duration: 0.04, ease: 'expo.out' },
          t + 0.008,
        )
    })
    tl.to(afterglow, { opacity: 0.55, duration: 0.35, ease: 'power1.in' }, 0.38)

    // ── [0.80–0.88] SNAP ─────────────────────────────────────────────────────
    tl.to(
      slashEls,
      {
        filter: 'brightness(8) blur(0.5px)',
        boxShadow: '0 0 18px 5px rgba(140,210,255,1),0 0 60px 18px rgba(80,150,255,0.6)',
        duration: 0.08,
        ease: 'power4.in',
      },
      0.8,
    )
    tl.to(cold, { opacity: 0.92, duration: 0.08, ease: 'power3.in' }, 0.8)
    tl.to(
      hero,
      {
        scale: 1.26,
        filter: 'saturate(0) contrast(4) brightness(0.35)',
        duration: 0.08,
        ease: 'power3.in',
      },
      0.8,
    )
    tl.fromTo(
      crosshair,
      { opacity: 0, scale: 2.4, filter: 'blur(6px)' },
      { opacity: 1, scale: 0.018, filter: 'blur(0px)', duration: 0.055, ease: 'expo.out' },
      0.845,
    )
    tl.to(crosshair, { opacity: 0, scale: 0.001, duration: 0.02, ease: 'expo.out' }, 0.9)
    tl.to(flash, { opacity: 1, duration: 0.012, ease: 'none' }, 0.865)
    tl.to(flash, { opacity: 0, duration: 0.07, ease: 'expo.out' }, 0.877)
    tl.to(aberr, { opacity: 1, duration: 0.01, ease: 'none' }, 0.87)
    tl.to(aberr, { opacity: 0, duration: 0.04, ease: 'power2.out' }, 0.88)

    // buildFragments injects its own tweens into tl at positions 0.9+
    tl.call(buildFragments, [], 0.84)

    // ── [0.90] SHATTER ───────────────────────────────────────────────────────
    tl.to(hero, { scale: 2.18, z: 180, opacity: 1, duration: 0.028, ease: 'expo.inOut' }, 0.885)
    tl.to(hero, { scale: 1.28, z: -260, opacity: 0, duration: 0.08, ease: 'expo.inOut' }, 0.915)
    tl.fromTo(
      frags,
      { scale: 1.18, z: 220 },
      { scale: 0.94, z: -180, duration: 0.085, ease: 'expo.inOut' },
      0.9,
    )
    tl.to(frags, { opacity: 1, duration: 0.008 }, 0.9)
    if (content)
      tl.to(
        content,
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.08,
          ease: 'expo.out',
        },
        0.905,
      )
    tl.to(
      slashEls,
      {
        scaleX: 5,
        opacity: 0,
        filter: 'brightness(16) blur(10px)',
        duration: 0.06,
        ease: 'power4.in',
      },
      0.9,
    )
    tl.to(afterglow, { opacity: 0, duration: 0.07, ease: 'power2.out' }, 0.9)
    tl.to(cold, { opacity: 0, duration: 0.1, ease: 'power2.out' }, 0.9)
    tl.to(vignette, { opacity: 0, duration: 0.1, ease: 'power2.out' }, 0.9)

    // ── [0.97] RELEASE VOID LAYER ────────────────────────────────────────────
    const voidLayer = document.getElementById('void-layer')
    if (voidLayer) tl.to(voidLayer, { opacity: 0, duration: 0.03, ease: 'power2.out' }, 0.97)

    ScrollTrigger.create({
      trigger: spacer,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        tl.progress(self.progress)
      },
      onLeave: () => {
        gsap.set(hero, { display: 'none' })
        gsap.set(wrap, { display: 'block' })
        gsap.set([cold, vignette, aberr, afterglow, flash, crosshair], { opacity: 0 })
        gsap.set(slashWrap, { opacity: 1 })
        gsap.set(slashEls, { opacity: 0 })
        gsap.set(frags, { opacity: 1, scale: 1, z: 0 })
        continueSpatialFragments(frags)
        spawnCarryoverSpatialFragments(frags)
        frags.querySelectorAll('.void-aftermath-shard').forEach((node) => node.remove())
        spawnAftermathShards(frags)
        releaseRef.current?.kill()
        releaseRef.current = gsap.delayedCall(2.8, () => {
          gsap.set(wrap, { display: 'none' })
          frags.querySelectorAll('.void-fragment').forEach((node) => gsap.killTweensOf(node))
          frags
            .querySelectorAll('.void-aftermath-shard,.void-carry-fragment')
            .forEach((node) => node.remove())
          gsap.set(frags, { opacity: 0 })
        })
        if (content)
          gsap.set(content, {
            position: 'relative',
            inset: 'auto',
            overflow: 'visible',
            pointerEvents: 'auto',
            opacity: 1,
            scale: 1,
            filter: 'none',
          })
      },
      onEnterBack: () => {
        releaseRef.current?.kill()
        releaseRef.current = null
        gsap.set(hero, { display: 'flex', opacity: 1, filter: 'none', x: 0, y: 0, scale: 1 })
        gsap.set(wrap, { display: 'block' })
        gsap.set([cold, vignette, aberr, afterglow, flash, crosshair], { opacity: 0 })
        gsap.set(slashWrap, { opacity: 1 })
        if (content)
          gsap.set(content, {
            position: 'fixed',
            inset: 0,
            opacity: 0,
            scale: 0.9,
            filter: 'blur(28px)',
            overflow: 'hidden',
            pointerEvents: 'none',
            transformOrigin: '50% 50%',
          })
        const vl = document.getElementById('void-layer')
        if (vl) gsap.set(vl, { opacity: 1 })
        capturedRef.current = false
        if (fragRef.current) {
          fragRef.current
            .querySelectorAll('.void-fragment,.void-aftermath-shard,.void-carry-fragment')
            .forEach((node) => gsap.killTweensOf(node))
          fragRef.current.innerHTML = ''
          gsap.set(fragRef.current, { opacity: 0 })
        }
        gsap.set(crosshair, { opacity: 0, scale: 1, filter: 'blur(0px)' })
      },
    })

    return () => {
      releaseRef.current?.kill()
      tl.kill()
      tlRef.current = null
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [heroRef, spacerRef, contentRef, buildFragments])

  return (
    <div ref={wrapRef} className="pointer-events-none">
      <div
        ref={vignetteRef}
        className="fixed inset-0 z-[11] opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.97) 100%)',
        }}
      />
      <div
        ref={coldRef}
        className="fixed inset-0 z-[12] opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 85% at 50% 50%, rgba(6,24,100,0.5) 0%, rgba(0,3,20,0.9) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        ref={aberrRef}
        className="fixed inset-0 z-[14] opacity-0"
        style={{
          boxShadow: 'inset 8px 0 0 rgba(255,0,50,0.4), inset -8px 0 0 rgba(0,210,255,0.4)',
          mixBlendMode: 'screen',
        }}
      />

      <div ref={slashesRef} className="fixed inset-0 z-[20] overflow-hidden">
        {SLASHES.map((s, i) => {
          const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) * 1.4
          const angle = Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * (180 / Math.PI)
          const base = {
            position: 'absolute' as const,
            left: `${s.x1}%`,
            top: `${s.y1}%`,
            width: `${len}%`,
            height: `${s.width}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 50%',
            opacity: 0,
          }
          return (
            <div key={i}>
              <div
                className="void-slash-line"
                style={{
                  ...base,
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(160,215,255,0.65) 10%, white 40%, rgba(160,215,255,0.65) 90%, transparent 100%)',
                  boxShadow: `0 0 ${s.width * 5}px ${s.width * 2}px rgba(120,195,255,0.95), 0 0 ${s.width * 18}px ${s.width * 5}px rgba(70,140,255,0.5)`,
                  filter: 'brightness(2)',
                }}
              />
              <div
                style={{
                  ...base,
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,50,50,0.32) 22%, rgba(0,230,255,0.32) 78%, transparent 100%)',
                  height: `${s.width * 0.55}px`,
                  marginTop: `${s.width * 0.9}px`,
                  opacity: 0,
                }}
              />
            </div>
          )
        })}
      </div>

      <div
        ref={afterglowRef}
        className="fixed inset-0 z-[21] opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 75% at 50% 50%, rgba(30,90,255,0.14) 0%, transparent 65%)',
          mixBlendMode: 'screen',
          filter: 'blur(10px)',
        }}
      />
      <div
        ref={fragRef}
        className="fixed inset-0 z-[25] opacity-0"
        style={{ perspective: '760px', transformStyle: 'preserve-3d' }}
      />
      <div ref={flashRef} className="fixed inset-0 z-[30] opacity-0 bg-white" />
      <div ref={crosshairRef} className="fixed inset-0 z-[31] opacity-0 pointer-events-none">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-white shadow-[0_0_12px_2px_rgba(180,220,255,1)]" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-px bg-white shadow-[0_0_12px_2px_rgba(180,220,255,1)]" />
      </div>
    </div>
  )
}
