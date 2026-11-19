import { motion, type MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, invalidate, useFrame } from '@react-three/fiber'
import { DoubleSide, Vector2 } from 'three'

// 全屏胶片噪点蒙层（移植自 speakio 首页）：独立 Canvas + multiply 混合，
// frameloop="demand" 节流到 ~0.8fps，几乎不占性能。
const CONFIG = { zIndex: 100, opacity: 0.55, alpha: 1 }
const SHADER_VERSION = 'noise-v1'
const num = (v: number) => v.toFixed(3)

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy;
    float frame = uTime;
    float grain = hash(pixel + floor(frame) * 61.0);
    vec3 color = vec3(1.0 - 0.35 * grain);
    gl_FragColor = vec4(color, ${num(CONFIG.alpha)});
  }
`

function NoisePlane() {
  const materialRef = useRef<any>(null)
  const resolution = useMemo(() => new Vector2(), [])
  const lastTimeRef = useRef(-999)
  const frameRate = 1

  useFrame(({ clock, size }) => {
    if (!materialRef.current) return
    if (clock.elapsedTime - lastTimeRef.current < (1 / frameRate) * 0.5) return
    lastTimeRef.current = clock.elapsedTime
    materialRef.current.uniforms.uTime.value = clock.elapsedTime % 10000
    resolution.set(size.width, size.height)
    materialRef.current.uniforms.uResolution.value = resolution
  })

  // demand 模式：定时 invalidate 触发重绘，得到缓慢闪动的颗粒
  useEffect(() => {
    const interval = setInterval(() => invalidate(), 1000 / frameRate)
    return () => clearInterval(interval)
  }, [])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uResolution: { value: resolution } }),
    [resolution]
  )

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={SHADER_VERSION}
        ref={materialRef}
        transparent
        depthTest={false}
        depthWrite={false}
        side={DoubleSide}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}

export default function NoiseOverlay({ opacity }: { opacity: MotionValue<number> }) {
  // 仅客户端挂载，避免 SSR 不一致（此项目纯 CSR，仍保持一致写法）
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <motion.div
      aria-hidden="true"
      data-three-noise-overlay={SHADER_VERSION}
      style={{
        opacity,
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: CONFIG.zIndex,
        mixBlendMode: 'multiply',
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%', opacity: CONFIG.opacity, pointerEvents: 'none' }}
        frameloop="demand"
        camera={{ position: [0, 0, 1] }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <NoisePlane />
      </Canvas>
    </motion.div>
  )
}
