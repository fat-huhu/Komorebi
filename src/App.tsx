// ========================================
// 📐 数学工具函数
// ========================================
import { createElement as h, useEffect, useMemo, useRef, useState } from 'react'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const mapRange = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  clampOutput = true,
) => {
  if (Math.abs(inputMin - inputMax) < Number.EPSILON) return outputMin
  const outVal = ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin
  return clampOutput
    ? clamp(outVal, Math.min(outputMin, outputMax), Math.max(outputMin, outputMax))
    : outVal
}

// ========================================
// 🎨 主组件
// ========================================
export function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [vh, setVh] = useState(0)
  const containerRef = useRef(null)

  // 优化滚动循环使用 RequestAnimationFrame
  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight)
    handleResize()
    window.addEventListener('resize', handleResize)

    let rafId: number
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollProgress(window.scrollY)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // 配置
  const TOTAL_HEIGHT_VH = 1100

  // 章节进度计算辅助函数
  const getSectionProgress = (startVh: number, durationVh: number) => {
    const start = startVh * vh
    const end = start + durationVh * vh
    return mapRange(scrollProgress, start, end, 0, 1)
  }

  // 章节进度
  const p1 = getSectionProgress(0, 2) // 创世 (0-200vh)
  const p2 = getSectionProgress(2, 4) // 混沌 (200-600vh)
  const p3 = getSectionProgress(6, 3) // 结构 (600-900vh)
  const p4 = getSectionProgress(9, 2) // 升华 (900-1100vh)

  // 混沌元素数据
  const chaosElements = useMemo(
    () => [
      { emoji: 'JAVA', x: -20, y: -30, r: 45, delay: 0 },
      { emoji: 'WEB', x: 30, y: -20, r: -15, delay: 0.1 },
      { emoji: 'AI', x: -40, y: 20, r: 90, delay: 0.2 },
      { emoji: 'Arr.', x: 25, y: 40, r: -60, delay: 0.3 },
      { emoji: 'IGD', x: 0, y: -50, r: 180, delay: 0.4 },
      { emoji: 'C-Novel', x: 45, y: 10, r: 30, delay: 0.15 },
    ],
    [],
  )

  return h(
    'div',
    // eslint-disable-next-line react-hooks/refs
    {
      ref: containerRef,
      className:
        'relative w-full bg-[#050505] text-[#eaeaea] font-sans selection:bg-orange-500 selection:text-black',
      style: { fontFamily: "'Space Grotesk', sans-serif" },
    },
    // 全局叠加层
    // 1. 噪声纹理
    h('div', {
      className: 'fixed inset-0 z-50 pointer-events-none opacity-[0.07] mix-blend-overlay',
      style: {
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      },
    }),

    // 2. 晕影
    h('div', {
      className:
        'fixed inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]',
    }),

    // 3. 进度条
    h('div', {
      className: 'fixed top-0 left-0 h-1 bg-orange-500 z-50 transition-all duration-75',
      style: { width: (scrollProgress / ((TOTAL_HEIGHT_VH / 100) * vh)) * 100 + '%' },
    }),

    // 4. 状态指示器
    h(
      'div',
      {
        className:
          'fixed bottom-8 right-8 z-50 font-mono text-xs tracking-widest opacity-60 mix-blend-difference flex flex-col items-end gap-1',
      },
      h('span', null, 'Y: ' + Math.floor(scrollProgress)),
      h(
        'span',
        null,
        'SECTOR: ' +
          (p1 > 0 && p1 < 1 ? '01' : p2 > 0 && p2 < 1 ? '02' : p3 > 0 && p3 < 1 ? '03' : '04'),
      ),
    ),

    // 章节 1: 创世
    h(
      'div',
      {
        style: { height: '200vh' },
        className: 'relative z-10',
      },
      h(
        'div',
        {
          className:
            'sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden',
        },
        // 背景渐变移位
        h('div', {
          className: 'absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-50',
          style: { opacity: mapRange(p1, 0.5, 1, 1, 0) },
        }),

        h(
          'div',
          { className: 'relative z-10 text-center mix-blend-color-dodge' },
          h(
            'h1',
            {
              className:
                'text-[12vw] font-black leading-none tracking-tighter will-change-transform',
              style: {
                transform: 'scale(' + mapRange(p1, 0, 0.8, 0.5, 25) + ')',
                opacity: mapRange(p1, 0.6, 0.8, 1, 0),
              },
            },
            'WENHE',
          ),
          h(
            'p',
            {
              className: 'font-mono text-orange-500 tracking-[1em] text-sm mt-4 uppercase',
              style: {
                opacity: mapRange(p1, 0, 0.3, 1, 0),
                transform: 'translateY(' + mapRange(p1, 0, 0.3, 0, -50) + 'px)',
              },
            },
            'Personal Homepage',
          ),
        ),

        // 过渡文本
        h(
          'div',
          { className: 'absolute inset-0 flex items-center justify-center pointer-events-none' },
          h(
            'p',
            {
              className:
                'text-4xl md:text-6xl font-light tracking-tighter text-center max-w-4xl leading-tight',
              style: {
                opacity: mapRange(p1, 0.7, 0.9, 0, 1),
                transform: 'scale(' + mapRange(p1, 0.7, 1, 0.9, 1.1) + ')',
              },
            },
            'It starts with a ',
            h('span', { className: 'font-serif italic text-orange-400' }, 'personal vision'),
            '. ',
            h('br'),
            'A homepage shaped by design, code, and visual storytelling.',
          ),
        ),
      ),
    ),

    // 章节 2: 混沌
    h(
      'div',
      {
        style: { height: '400vh' },
        className: 'relative z-10 bg-[#eaeaea] text-black',
      },
      h(
        'div',
        {
          className:
            'sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden perspective-1000',
        },
        h(
          'div',
          {
            className:
              'absolute top-10 w-full flex justify-between px-10 uppercase text-xs font-bold tracking-widest border-b border-black/10 pb-4',
          },
          h('span', null, 'Phase II'),
          h('span', null, 'Skills / Creative Focus'),
          h('span', null, 'Status: Available'),
        ),

        h(
          'div',
          { className: 'relative w-full h-full flex items-center justify-center' },
          // 中心锚点
          h('div', {
            className: 'z-20 w-px h-32 bg-black/20',
            style: { transform: 'scaleY(' + mapRange(p2, 0, 0.2, 0, 1) + ')' },
          }),

          // 混沌粒子系统
          ...chaosElements.map((item, i) => {
            const randomX = item.x * 10
            const randomY = item.y * 10
            const randomR = item.r * 2

            const gridCol = (i % 3) - 1
            const gridRow = Math.floor(i / 3) - 0.5
            const snapX = gridCol * 150
            const snapY = gridRow * 150

            const currentX = mapRange(p2, 0, 0.6, randomX, snapX)
            const currentY = mapRange(p2, 0, 0.6, randomY, snapY)
            const currentR = mapRange(p2, 0, 0.6, randomR + p2 * 360, 0)
            const currentScale = mapRange(p2, 0, 0.6, 1.5, 1)

            return h(
              'div',
              {
                key: i,
                className:
                  'absolute flex items-center justify-center w-36 h-24 border border-black/80 bg-white/50 backdrop-blur-sm',
                style: {
                  transform:
                    'translate(' +
                    currentX +
                    'px, ' +
                    currentY +
                    'px) rotate(' +
                    currentR +
                    'deg) scale(' +
                    currentScale +
                    ')',
                  opacity: mapRange(p2, 0, 0.1, 0, 1),
                },
              },
              h('span', { className: 'text-4xl' }, item.emoji),
            )
          }),

          // 对齐文本叠加
          h(
            'h2',
            {
              className:
                'absolute z-30 text-9xl font-black tracking-tighter opacity-0 mix-blend-difference text-white',
              style: {
                opacity: mapRange(p2, 0.65, 0.75, 0, 1),
                transform: 'scale(' + mapRange(p2, 0.6, 0.8, 0.8, 1) + ')',
              },
            },
            'PROFILE',
          ),
        ),
      ),
    ),

    // 章节 3: 结构
    h(
      'div',
      {
        style: { height: '300vh' },
        className: 'relative z-10 bg-[#0a0a0a] text-white perspective-1000',
      },
      h(
        'div',
        { className: 'sticky top-0 h-screen flex items-center justify-center overflow-hidden' },
        // 背景网格
        h('div', {
          className: 'absolute inset-0 opacity-20 pointer-events-none',
          style: {
            backgroundImage:
              'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'translateY(' + mapRange(p3, 0, 0.7, 0, 100) + 'px) rotateX(60deg)',
            transformOrigin: 'center top',
          },
        }),

        // 3D 卡片
        h(
          'div',
          { className: 'relative group' },
          h(
            'div',
            {
              className:
                'relative w-[600px] h-[400px] rounded-2xl bg-gradient-to-br from-gray-800/40 to-black/40 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl',
              style: {
                transform:
                  'perspective(1000px) rotateX(' +
                  mapRange(p3, 0, 0.7, 20, 0) +
                  'deg) rotateY(' +
                  mapRange(p3, 0, 0.7, -20, 0) +
                  'deg) scale(' +
                  mapRange(p3, 0, 0.7, 0.8, 1) +
                  ')',
              },
            },
            // 动态闪光效果
            h('div', {
              className:
                'absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-20',
              style: {
                transform: 'translateX(' + mapRange(p3, 0, 0.7, -100, 100) + '%) skewX(-20deg)',
              },
            }),

            // 卡片内容
            h(
              'div',
              {
                className:
                  'absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10',
              },
              h(
                'div',
                {
                  className:
                    'w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.4)]',
                },
                h('span', { className: 'text-3xl font-black tracking-tight' }, 'WH'),
              ),
              h('h3', { className: 'text-4xl font-bold mb-2 tracking-tight' }, 'WENHE / About Me'),
              h(
                'p',
                { className: 'text-gray-400 text-sm leading-relaxed max-w-xs' },
                'I build expressive digital experiences across web design, creative coding, motion, and personal branding.',
              ),
              h(
                'div',
                { className: 'mt-8 flex gap-2' },
                h('div', { className: 'h-1 w-2 bg-orange-500 rounded-full animate-pulse' }),
                h('div', { className: 'h-1 w-8 bg-gray-700 rounded-full' }),
                h('div', { className: 'h-1 w-2 bg-gray-700 rounded-full' }),
              ),
            ),
          ),

          // 背面光晕
          h('div', {
            className: 'absolute -inset-10 bg-orange-500/20 blur-3xl -z-10 rounded-full',
            style: { opacity: mapRange(p3, 0.5, 1, 0, 0.5) },
          }),
        ),
      ),
    ),

    // 章节 4: 升华
    h(
      'div',
      {
        style: { height: '200vh' },
        className: 'relative z-10 bg-black overflow-hidden',
      },
      h(
        'div',
        { className: 'sticky top-0 h-screen flex flex-col items-center justify-center' },
        // 曲速星空
        h(
          'div',
          { className: 'absolute inset-0 overflow-hidden' },
          ...[...Array(20)].map((_, i) =>
            h('div', {
              key: i,
              className: 'absolute w-0.5 bg-white rounded-full',
              style: {
                // eslint-disable-next-line react-hooks/purity
                left: Math.random() * 100 + '%',
                top: '50%',
                height: '100px',
                transformOrigin: 'center',
                transform:
                  'rotate(' +
                  // eslint-disable-next-line react-hooks/purity
                  Math.random() * 360 +
                  'deg) translateY(' +
                  mapRange(p4, 0, 1, 200, 1000) +
                  'px)',
                opacity: mapRange(p4, 0, 0.5, 0, 0.8),
              },
            }),
          ),
        ),

        // 文字分离效果（色彩分离）
        h(
          'div',
          { className: 'relative z-10' },
          // 红色通道
          h(
            'h1',
            {
              className:
                'absolute inset-0 text-[15vw] font-black text-red-500 mix-blend-screen leading-none text-center',
              style: {
                transform:
                  'translateX(' +
                  mapRange(p4, 0, 1, -10, 0) +
                  'px) scale(' +
                  mapRange(p4, 0, 1, 0.9, 1) +
                  ')',
              },
            },
            'CONTACT',
          ),

          // 青色通道
          h(
            'h1',
            {
              className:
                'absolute inset-0 text-[15vw] font-black text-cyan-500 mix-blend-screen leading-none text-center',
              style: {
                transform:
                  'translateX(' +
                  mapRange(p4, 0, 1, 10, 0) +
                  'px) scale(' +
                  mapRange(p4, 0, 1, 1.1, 1) +
                  ')',
              },
            },
            'CONTACT',
          ),

          // 主白色
          h(
            'h1',
            {
              className:
                'relative text-[15vw] font-black text-white leading-none text-center mix-blend-overlay',
            },
            'CONTACT',
          ),
        ),

        // 最终按钮
        h(
          'div',
          {
            className: 'mt-12 z-50',
            style: {
              opacity: mapRange(p4, 0.8, 1, 0, 1),
              transform: 'translateY(' + mapRange(p4, 0.8, 1, 50, 0) + 'px)',
            },
          },
          h(
            'button',
            {
              onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
              className:
                'group relative px-8 py-4 bg-white text-black font-bold tracking-widest hover:bg-orange-500 transition-colors duration-300 overflow-hidden',
            },
            h('span', { className: 'relative z-10' }, 'BACK TO TOP'),
            h('div', {
              className:
                'absolute inset-0 bg-orange-500 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out',
            }),
          ),
        ),
      ),
    ),

    // 结束部分
    h(
      'div',
      { className: 'h-[50vh] bg-black flex items-center justify-center' },
      h('p', { className: 'text-gray-700 font-mono text-xs' }, 'WENHE / OPEN TO COLLABORATION'),
    ),
  )
}
