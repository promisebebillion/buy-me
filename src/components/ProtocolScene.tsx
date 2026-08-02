import { Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function seeded(index: number) {
  const value = Math.sin(index * 9283.17 + 17.31) * 43758.5453
  return value - Math.floor(value)
}

const pointVertexShader = `
  uniform float uTime;
  uniform float uSize;
  varying float vPulse;
  void main() {
    vec3 p = position;
    float wave = sin(uTime * 1.35 + position.y * 4.1 + position.x * 2.3 + position.z * 3.7);
    float drift = cos(uTime * 0.72 + position.x * 3.0 - position.y * 1.7);
    p += vec3(wave, drift, wave * drift) * 0.008;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * (7.5 / max(1.0, -mvPosition.z));
    vPulse = 0.68 + 0.32 * sin(uTime * 2.2 + position.y * 5.0 + position.x * 3.0);
  }
`

const pointFragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vPulse;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float circle = smoothstep(0.5, 0.12, length(uv));
    gl_FragColor = vec4(uColor, circle * uOpacity * vPulse);
  }
`

function sampleEllipsoid(
  target: number[],
  center: THREE.Vector3,
  radii: THREE.Vector3,
  count: number,
  seedOffset: number,
  rotation = new THREE.Euler(),
) {
  for (let i = 0; i < count; i += 1) {
    const z = seeded(seedOffset + i) * 2 - 1
    const theta = seeded(seedOffset + i + 9000) * Math.PI * 2
    const radial = Math.sqrt(1 - z * z)
    const point = new THREE.Vector3(
      radial * Math.cos(theta) * radii.x,
      z * radii.y,
      radial * Math.sin(theta) * radii.z,
    )
    point.applyEuler(rotation).add(center)
    target.push(point.x, point.y, point.z)
  }
}

function sampleTube(
  target: number[],
  curve: THREE.Curve<THREE.Vector3>,
  radiusStart: number,
  radiusEnd: number,
  count: number,
  seedOffset: number,
) {
  const fallback = new THREE.Vector3(0, 0, 1)
  for (let i = 0; i < count; i += 1) {
    const t = seeded(seedOffset + i)
    const center = curve.getPoint(t)
    const tangent = curve.getTangent(t).normalize()
    let normal = new THREE.Vector3().crossVectors(tangent, fallback).normalize()
    if (normal.lengthSq() < 0.01) normal = new THREE.Vector3(1, 0, 0)
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
    const angle = seeded(seedOffset + i + 7000) * Math.PI * 2
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, t)
    const surface = normal.multiplyScalar(Math.cos(angle) * radius).add(binormal.multiplyScalar(Math.sin(angle) * radius))
    center.add(surface)
    target.push(center.x, center.y, center.z)
  }
}

function AnimatedPointCloud({ positions, color, size, opacity = 1 }: { positions: Float32Array; color: string; size: number; opacity?: number }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={pointVertexShader}
        fragmentShader={pointFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uSize: { value: size },
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: opacity },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function IntroObject() {
  const group = useRef<THREE.Group>(null)

  const hand = useMemo(() => {
    const values: number[] = []
    sampleEllipsoid(values, new THREE.Vector3(0, -0.78, -0.02), new THREE.Vector3(1.12, 1.42, 0.43), 2500, 1000, new THREE.Euler(0.08, 0.03, -0.08))
    sampleEllipsoid(values, new THREE.Vector3(0.04, -2.05, 0.02), new THREE.Vector3(0.68, 0.94, 0.48), 900, 5000, new THREE.Euler(0, 0, 0.04))

    const fingers = [
      { start: [-0.86, 0.18, -0.02], c1: [-1.2, 0.92, 0.0], c2: [-1.22, 1.85, 0.22], end: [-0.58, 2.22, 0.36], r: 0.25 },
      { start: [-0.42, 0.48, -0.04], c1: [-0.67, 1.25, -0.03], c2: [-0.61, 2.22, 0.17], end: [-0.1, 2.42, 0.38], r: 0.26 },
      { start: [0.03, 0.53, -0.05], c1: [-0.04, 1.38, -0.05], c2: [0.08, 2.3, 0.18], end: [0.45, 2.38, 0.4], r: 0.255 },
      { start: [0.45, 0.38, -0.02], c1: [0.58, 1.17, 0.0], c2: [0.72, 2.02, 0.22], end: [0.92, 2.12, 0.39], r: 0.235 },
    ]
    fingers.forEach((finger, index) => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(...finger.start as [number, number, number]),
        new THREE.Vector3(...finger.c1 as [number, number, number]),
        new THREE.Vector3(...finger.c2 as [number, number, number]),
        new THREE.Vector3(...finger.end as [number, number, number]),
      )
      sampleTube(values, curve, finger.r, finger.r * 0.72, 720, 12000 + index * 1900)
    })

    const thumbCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.98, -0.45, 0.02),
      new THREE.Vector3(-1.62, -0.02, 0.14),
      new THREE.Vector3(-1.28, 0.72, 0.45),
      new THREE.Vector3(-0.58, 0.94, 0.62),
    )
    sampleTube(values, thumbCurve, 0.34, 0.23, 950, 22000)
    return new Float32Array(values)
  }, [])

  const dollar = useMemo(() => {
    const values: number[] = []
    const sCurve = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, index) => {
      const t = index / 12
      return new THREE.Vector3(Math.sin(t * Math.PI * 2) * 0.48, 1.95 - t * 2.05, 0.73 + Math.cos(t * Math.PI * 2) * 0.08)
    }))
    sampleTube(values, sCurve, 0.085, 0.085, 1600, 28000)
    const stem = new THREE.LineCurve3(new THREE.Vector3(0, -0.33, 0.72), new THREE.Vector3(0, 2.18, 0.72))
    sampleTube(values, stem, 0.052, 0.052, 650, 33000)
    return new Float32Array(values)
  }, [])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = -0.08 + Math.sin(state.clock.elapsedTime * 0.35) * 0.055
    group.current.rotation.x = -0.04 + Math.cos(state.clock.elapsedTime * 0.28) * 0.025
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.035
  })

  return (
    <group ref={group} position={[0.25, 0, 0]} rotation={[-0.04, -0.08, 0.03]} scale={0.92}>
      <AnimatedPointCloud positions={hand} color="#dadbd7" size={4.4} opacity={0.82} />
      <AnimatedPointCloud positions={dollar} color="#0EFF00" size={6.3} opacity={1} />
      <pointLight position={[0, 0.9, 0.85]} color="#0EFF00" intensity={7} distance={3.8} />
      <Line points={[[-1.65, -2.62, -0.1], [1.42, -2.62, -0.1]]} color="#f0eee8" transparent opacity={0.16} lineWidth={0.45} />
    </group>
  )
}

export function ReactiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000 }
    let frame = 0
    let width = 1
    let height = 1
    let dpr = 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 1.7)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.tx = event.clientX - rect.left
      pointer.ty = event.clientY - rect.top
    }

    const draw = (time: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.1
      pointer.y += (pointer.ty - pointer.y) * 0.1
      context.clearRect(0, 0, width, height)
      context.fillStyle = 'rgba(3, 5, 6, 0.25)'
      context.fillRect(0, 0, width, height)
      const cell = 24
      const phase = time * 0.0012
      for (let x = 0; x <= width; x += cell) {
        for (let y = 0; y <= height; y += cell) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const glow = Math.max(0, 1 - distance / 180)
          const wave = (Math.sin(x * 0.035 + y * 0.024 - phase * 3) + 1) * 0.5
          const alpha = 0.035 + glow * (0.22 + wave * 0.13)
          context.strokeStyle = `rgba(${glow > 0.62 ? '14,255,0' : '130,185,132'},${alpha})`
          context.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1)
          if (glow > 0.28) {
            context.fillStyle = `rgba(14,255,0,${glow * wave * 0.065})`
            context.fillRect(x + 2, y + 2, cell - 4, cell - 4)
          }
        }
      }
      frame = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('pointermove', move)
    resize()
    frame = requestAnimationFrame(draw)
    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="reactive-grid" aria-hidden="true" />
}

function BurnObject() {
  const group = useRef<THREE.Group>(null)

  const particles = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 1500; i += 1) {
      const x = seeded(i) * 7.6 - 4.1
      const distanceFromGate = Math.abs(x + 0.15)
      const envelope = x < -0.15
        ? 0.08 + Math.pow(distanceFromGate / 3.95, 1.25) * 1.3
        : 0.05 + Math.pow(distanceFromGate / 3.45, 0.9) * 0.7
      const angle = seeded(i + 2200) * Math.PI * 2
      const radius = Math.sqrt(seeded(i + 4400)) * envelope
      values.push(x, Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    return new Float32Array(values)
  }, [])

  const streams = useMemo(() => {
    return Array.from({ length: 18 }, (_, lineIndex) => {
      const theta = (lineIndex / 18) * Math.PI * 2
      return Array.from({ length: 18 }, (_, index) => {
        const x = -4 + (index / 17) * 3.82
        const radius = ((-x - 0.18) / 3.82) * (0.38 + (lineIndex % 5) * 0.15)
        return new THREE.Vector3(x, Math.cos(theta) * radius, Math.sin(theta) * radius)
      })
    })
  }, [])

  const gate = useMemo(
    () => Array.from({ length: 5 }, (_, i) => [
      new THREE.Vector3(-0.15, -1.75 + i * 0.12, 0),
      new THREE.Vector3(-0.15, 1.75 - i * 0.12, 0),
    ]),
    [],
  )

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.33) * 0.075
    group.current.rotation.y = -0.13 + Math.sin(state.clock.elapsedTime * 0.21) * 0.12
    group.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.27) * 0.025
  })

  return (
    <group ref={group} rotation={[-0.06, -0.13, 0]}>
      {streams.map((points, index) => (
        <Line key={index} points={points} color="#f0efea" transparent opacity={0.3} lineWidth={0.55} />
      ))}
      <AnimatedPointCloud positions={particles} color="#efeee8" size={4.1} opacity={0.88} />
      {gate.map((points, index) => (
        <Line key={index} points={points} color="#0EFF00" transparent opacity={0.28 + index * 0.13} lineWidth={1.1 + index * 0.35} />
      ))}
      <mesh position={[-0.15, 0, 0]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshBasicMaterial color="#0EFF00" />
        <pointLight color="#0EFF00" intensity={9} distance={2.7} />
      </mesh>
      <Line points={[[-4.35, 0, 0], [3.6, 0, 0]]} color="#ffffff" opacity={0.18} transparent lineWidth={0.5} />
    </group>
  )
}

function AirdropObject() {
  const group = useRef<THREE.Group>(null)

  const branches = useMemo(() => {
    return Array.from({ length: 25 }, (_, branchIndex) => {
      const targetY = ((branchIndex / 24) - 0.5) * 4.5
      const targetZ = (seeded(branchIndex + 8100) - 0.5) * 1.55
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-3.65, 0, 0),
        new THREE.Vector3(-2.05, targetY * 0.08, targetZ * 0.1),
        new THREE.Vector3(-1.2, targetY, targetZ),
        new THREE.Vector3(3.15 - seeded(branchIndex + 9000) * 0.65, targetY, targetZ),
      )
      return {
        points: curve.getPoints(30),
        end: curve.getPoint(1),
        accent: branchIndex === 2,
      }
    })
  }, [])

  const particles = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 650; i += 1) {
      const branch = branches[i % branches.length]
      const t = seeded(i + 11000)
      const curvePoint = branch.points[Math.min(30, Math.floor(t * 30))]
      values.push(
        curvePoint.x + (seeded(i + 12000) - 0.5) * 0.11,
        curvePoint.y + (seeded(i + 13000) - 0.5) * 0.11,
        curvePoint.z + (seeded(i + 14000) - 0.5) * 0.11,
      )
    }
    return new Float32Array(values)
  }, [branches])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = -0.08 + Math.sin(state.clock.elapsedTime * 0.2) * 0.055
    group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.16) * 0.025
  })

  return (
    <group ref={group} rotation={[0, -0.08, 0]}>
      {branches.map((branch, index) => (
        <group key={index}>
          <Line
            points={branch.points}
            color={branch.accent ? '#0EFF00' : '#e8e7e1'}
            transparent
            opacity={branch.accent ? 0.72 : 0.34}
            lineWidth={branch.accent ? 1.1 : 0.55}
          />
          <mesh position={branch.end}>
            <boxGeometry args={[0.115, 0.115, 0.115]} />
            <meshBasicMaterial color={branch.accent ? '#0EFF00' : '#efeee9'} wireframe />
          </mesh>
        </group>
      ))}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#f1efe9" size={0.028} transparent opacity={0.7} sizeAttenuation />
      </points>
      <mesh position={[-3.65, 0, 0]}>
        <boxGeometry args={[0.26, 0.26, 0.26]} />
        <meshBasicMaterial color="#0EFF00" />
        <pointLight color="#0EFF00" intensity={13} distance={3.4} />
      </mesh>
      {[0.42, 0.73, 1.12].map((radius) => {
        const ring = Array.from({ length: 65 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2
          return new THREE.Vector3(-3.65, Math.cos(angle) * radius, Math.sin(angle) * radius)
        })
        return <Line key={radius} points={ring} color="#efeee8" transparent opacity={0.17} lineWidth={0.45} />
      })}
    </group>
  )
}

function StakingObject() {
  const group = useRef<THREE.Group>(null)
  const orbitGroup = useRef<THREE.Group>(null)

  const orbits = useMemo(() => {
    return Array.from({ length: 6 }, (_, orbitIndex) => {
      const radiusX = 1.05 + orbitIndex * 0.47
      const radiusY = 0.68 + orbitIndex * 0.29
      return Array.from({ length: 100 }, (_, i) => {
        const angle = (i / 99) * Math.PI * 2
        return new THREE.Vector3(
          Math.cos(angle) * radiusX,
          Math.sin(angle) * radiusY,
          Math.sin(angle * 2 + orbitIndex) * 0.16,
        )
      })
    })
  }, [])

  const satellites = useMemo(() => {
    return Array.from({ length: 27 }, (_, index) => {
      const orbit = index % orbits.length
      const angle = seeded(index + 16000) * Math.PI * 2
      const radiusX = 1.05 + orbit * 0.47
      const radiusY = 0.68 + orbit * 0.29
      return new THREE.Vector3(
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY,
        Math.sin(angle * 2 + orbit) * 0.16,
      )
    })
  }, [orbits])

  const stream = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 520; i += 1) {
      const x = -4.45 + seeded(i + 19000) * 3.5
      const spread = Math.max(0.025, (-x - 0.95) * 0.11)
      values.push(x, (seeded(i + 20000) - 0.5) * spread, (seeded(i + 21000) - 0.5) * spread)
    }
    return new Float32Array(values)
  }, [])

  useFrame((state, delta) => {
    if (orbitGroup.current) orbitGroup.current.rotation.z += delta * 0.035
    if (group.current) group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.035
  })

  return (
    <group ref={group} rotation={[0.06, -0.12, 0]}>
      <group ref={orbitGroup}>
        {orbits.map((points, index) => (
          <Line
            key={index}
            points={points}
            color={index === 1 ? '#0EFF00' : '#e7e5df'}
            transparent
            opacity={index === 1 ? 0.5 : 0.25 + index * 0.025}
            lineWidth={index === 1 ? 0.8 : 0.55}
          />
        ))}
        {satellites.map((position, index) => (
          <mesh key={index} position={position}>
            <boxGeometry args={[0.11, 0.11, 0.11]} />
            <meshBasicMaterial color={index % 4 === 0 ? '#ffffff' : '#d9d8d2'} wireframe={index % 4 !== 0} />
          </mesh>
        ))}
      </group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stream, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#efede8" size={0.033} transparent opacity={0.72} sizeAttenuation />
      </points>
      <mesh>
        <torusGeometry args={[0.62, 0.055, 14, 80]} />
        <meshBasicMaterial color="#0EFF00" />
      </mesh>
      <mesh>
        <circleGeometry args={[0.49, 64]} />
        <meshBasicMaterial color="#090707" transparent opacity={0.95} />
        <pointLight color="#0EFF00" intensity={10} distance={3} />
      </mesh>
      <Line points={[[-4.5, 0, 0], [4.2, 0, 0]]} color="#f2f0ea" transparent opacity={0.24} lineWidth={0.5} />
    </group>
  )
}

function LocksObject() {
  const group = useRef<THREE.Group>(null)

  const gates = useMemo(() => {
    return Array.from({ length: 8 }, (_, index) => {
      const x = -2.55 + index * 0.72
      const inset = index * 0.025
      return [
        new THREE.Vector3(x, -1.56 + inset, -0.72),
        new THREE.Vector3(x, 1.56 - inset, -0.72),
        new THREE.Vector3(x, 1.56 - inset, 0.72),
        new THREE.Vector3(x, -1.56 + inset, 0.72),
        new THREE.Vector3(x, -1.56 + inset, -0.72),
      ]
    })
  }, [])

  const chamberParticles = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 430; i += 1) {
      const chamber = Math.floor(seeded(i + 23000) * 7)
      const x = -2.25 + chamber * 0.72 + (seeded(i + 24000) - 0.5) * 0.34
      values.push(x, (seeded(i + 25000) - 0.5) * 0.72, (seeded(i + 26000) - 0.5) * 0.62)
    }
    return new Float32Array(values)
  }, [])

  const flowParticles = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 240; i += 1) {
      const x = seeded(i + 27000) * 1.65 - 4.2
      const spread = (x + 4.2) * 0.08
      values.push(x, (seeded(i + 28000) - 0.5) * spread, (seeded(i + 29000) - 0.5) * spread)
    }
    return new Float32Array(values)
  }, [])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = -0.19 + Math.sin(state.clock.elapsedTime * 0.18) * 0.045
    group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.13) * 0.025
  })

  return (
    <group ref={group} rotation={[0.04, -0.19, 0]}>
      {gates.map((points, index) => (
        <group key={index}>
          <Line points={points} color="#e9e7e1" transparent opacity={0.28 + index * 0.025} lineWidth={0.7} />
          <Line
            points={points.map((point) => new THREE.Vector3(point.x + 0.12, point.y * 0.86, point.z * 0.82))}
            color="#e9e7e1"
            transparent
            opacity={0.14}
            lineWidth={0.45}
          />
          <mesh position={[points[0].x, 1.56 - index * 0.025, -0.72]}>
            <boxGeometry args={[0.105, 0.105, 0.105]} />
            <meshBasicMaterial color="#f0eee8" wireframe />
          </mesh>
        </group>
      ))}
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[chamberParticles, 3]} /></bufferGeometry>
        <pointsMaterial color="#e9e7e1" size={0.046} transparent opacity={0.68} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[flowParticles, 3]} /></bufferGeometry>
        <pointsMaterial color="#f4f1eb" size={0.035} transparent opacity={0.78} sizeAttenuation />
      </points>
      <mesh position={[-4.2, 0, 0]}>
        <torusGeometry args={[0.11, 0.028, 10, 32]} />
        <meshBasicMaterial color="#0EFF00" />
        <pointLight color="#0EFF00" intensity={8} distance={2.4} />
      </mesh>
      <mesh position={[3.55, 0, 0]}>
        <torusGeometry args={[0.11, 0.026, 10, 32]} />
        <meshBasicMaterial color="#efeee9" />
      </mesh>
      <Line points={[[-4.05, 0, 0], [3.44, 0, 0]]} color="#eeece6" transparent opacity={0.32} lineWidth={0.55} />
    </group>
  )
}

function LiquidityObject() {
  const group = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)

  const rings = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const rx = 0.72 + index * 0.39
      const ry = 0.42 + index * 0.2
      return Array.from({ length: 100 }, (_, i) => {
        const angle = (i / 99) * Math.PI * 2
        return new THREE.Vector3(Math.cos(angle) * rx, Math.sin(angle) * ry, Math.sin(angle + index) * 0.13)
      })
    })
  }, [])

  const streams = useMemo(() => {
    return ['buy', 'eth'].map((kind, streamIndex) => {
      const startY = streamIndex === 0 ? 1.72 : -1.72
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-4.05, startY, 0),
        new THREE.Vector3(-2.35, startY * 0.95, 0.18),
        new THREE.Vector3(-2.15, startY * 0.2, -0.2),
        new THREE.Vector3(-0.35, streamIndex === 0 ? 0.35 : -0.35, 0),
      )
      return { kind, points: curve.getPoints(45) }
    })
  }, [])

  const particles = useMemo(() => {
    const red: number[] = []
    const white: number[] = []
    for (let i = 0; i < 460; i += 1) {
      const streamIndex = i % 2
      const points = streams[streamIndex].points
      const point = points[Math.floor(seeded(i + 31000) * (points.length - 1))]
      const target = streamIndex === 0 ? red : white
      target.push(point.x, point.y + (seeded(i + 32000) - 0.5) * 0.16, point.z + (seeded(i + 33000) - 0.5) * 0.16)
    }
    return { red: new Float32Array(red), white: new Float32Array(white) }
  }, [streams])

  useFrame((state, delta) => {
    if (spin.current) spin.current.rotation.z += delta * 0.06
    if (group.current) group.current.rotation.x = 0.05 + Math.sin(state.clock.elapsedTime * 0.2) * 0.035
  })

  return (
    <group ref={group} rotation={[0.05, -0.12, -0.05]}>
      <group ref={spin}>
        {rings.map((points, index) => (
          <Line
            key={index}
            points={points}
            color={index === 2 || index === 3 ? '#0EFF00' : '#e9e7e1'}
            transparent
            opacity={index === 2 || index === 3 ? 0.62 : 0.24}
            lineWidth={index === 2 || index === 3 ? 0.85 : 0.55}
          />
        ))}
      </group>
      {streams.map((stream) => (
        <Line key={stream.kind} points={stream.points} color={stream.kind === 'buy' ? '#0EFF00' : '#eeece7'} transparent opacity={0.55} lineWidth={0.65} />
      ))}
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles.red, 3]} /></bufferGeometry>
        <pointsMaterial color="#0EFF00" size={0.038} transparent opacity={0.85} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles.white, 3]} /></bufferGeometry>
        <pointsMaterial color="#f1efe9" size={0.038} transparent opacity={0.82} sizeAttenuation />
      </points>
      <mesh>
        <torusGeometry args={[0.56, 0.022, 12, 64]} />
        <meshBasicMaterial color="#ebe9e3" transparent opacity={0.6} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={index} position={[3.5 + (index % 3) * 0.45, 0.28 - Math.floor(index / 3) * 0.56, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial color={index % 3 === 2 ? '#f0eee8' : '#0EFF00'} wireframe />
        </mesh>
      ))}
      <Line points={[[2.5, 0, 0], [3.35, 0, 0]]} color="#edeae4" transparent opacity={0.55} lineWidth={0.65} />
    </group>
  )
}

function BuybacksObject() {
  const group = useRef<THREE.Group>(null)

  const marketPoints = useMemo(() => {
    const white: number[] = []
    const red: number[] = []
    for (let i = 0; i < 850; i += 1) {
      const phi = Math.acos(1 - 2 * seeded(i + 35000))
      const theta = seeded(i + 36000) * Math.PI * 2
      const radius = 1.62 + (seeded(i + 37000) - 0.5) * 0.12
      const point = [
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
      ]
      const target = point[0] > 0 ? red : white
      target.push(point[0], point[1], point[2])
    }
    return { white: new Float32Array(white), red: new Float32Array(red) }
  }, [])

  const routes = useMemo(() => {
    return [-1.45, 0, 1.45].map((targetY) => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(1.72, 0, 0),
        new THREE.Vector3(2.45, 0, 0),
        new THREE.Vector3(2.62, targetY, 0),
        new THREE.Vector3(3.8, targetY, 0),
      )
      return { points: curve.getPoints(35), end: curve.getPoint(1) }
    })
  }, [])

  const revenue = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 260; i += 1) {
      const x = seeded(i + 38000) * 1.55 - 4.0
      const spread = Math.max(0.04, (x + 4) * 0.09)
      values.push(x, (seeded(i + 39000) - 0.5) * spread, (seeded(i + 40000) - 0.5) * spread)
    }
    return new Float32Array(values)
  }, [])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = -0.1 + Math.sin(state.clock.elapsedTime * 0.17) * 0.055
  })

  return (
    <group ref={group} rotation={[0, -0.1, 0]}>
      {[1.8, 2.04, 2.32].map((radius) => {
        const points = Array.from({ length: 90 }, (_, i) => {
          const angle = (i / 89) * Math.PI * 2
          return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
        })
        return <Line key={radius} points={points} color="#e9e7e1" transparent opacity={0.11} lineWidth={0.45} />
      })}
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[marketPoints.white, 3]} /></bufferGeometry>
        <pointsMaterial color="#efede7" size={0.035} transparent opacity={0.78} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[marketPoints.red, 3]} /></bufferGeometry>
        <pointsMaterial color="#0EFF00" size={0.035} transparent opacity={0.86} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[revenue, 3]} /></bufferGeometry>
        <pointsMaterial color="#f0eee9" size={0.034} transparent opacity={0.75} sizeAttenuation />
      </points>
      <Line points={[[-4.1, 0, 0], [-1.72, 0, 0]]} color="#eeeae4" transparent opacity={0.5} lineWidth={0.6} />
      {routes.map((route, index) => (
        <group key={index}>
          <Line points={route.points} color="#0EFF00" transparent opacity={0.74} lineWidth={0.85} />
          <mesh position={route.end}>
            <boxGeometry args={[0.28, 0.28, 0.28]} />
            <meshBasicMaterial color={index === 1 ? '#f0eee8' : '#0EFF00'} wireframe />
          </mesh>
        </group>
      ))}
      <mesh position={[1.72, 0, 0]}>
        <torusGeometry args={[0.3, 0.025, 10, 48]} />
        <meshBasicMaterial color="#efede7" />
      </mesh>
    </group>
  )
}

function FlywheelObject() {
  const group = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Group>(null)

  const rings = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => {
      const radius = 0.95 + index * 0.29
      return Array.from({ length: 110 }, (_, i) => {
        const angle = (i / 109) * Math.PI * 2
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          Math.sin(angle * 3 + index) * 0.08,
        )
      })
    })
  }, [])

  const particles = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 720; i += 1) {
      const angle = seeded(i + 41000) * Math.PI * 2
      const radius = 1.1 + seeded(i + 42000) * 2.55
      values.push(Math.cos(angle) * radius, Math.sin(angle) * radius, (seeded(i + 43000) - 0.5) * 0.45)
    }
    return new Float32Array(values)
  }, [])

  useFrame((state, delta) => {
    if (orbit.current) orbit.current.rotation.z -= delta * 0.025
    if (group.current) group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.035
  })

  return (
    <group ref={group} scale={0.92}>
      <group ref={orbit}>
        {rings.map((points, index) => (
          <Line
            key={index}
            points={points}
            color={index === 2 || index === 6 ? '#0EFF00' : '#e7e5df'}
            transparent
            opacity={index === 2 || index === 6 ? 0.52 : 0.12 + index * 0.014}
            lineWidth={index === 2 || index === 6 ? 0.78 : 0.42}
          />
        ))}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
          <pointsMaterial color="#eeeae4" size={0.028} transparent opacity={0.5} sizeAttenuation />
        </points>
      </group>
      <mesh>
        <circleGeometry args={[0.56, 72]} />
        <meshBasicMaterial color="#080909" transparent opacity={0.96} />
        <pointLight color="#0EFF00" intensity={5} distance={2.4} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.6, 0.016, 10, 64]} />
        <meshBasicMaterial color="#dcd9d3" transparent opacity={0.72} />
      </mesh>
    </group>
  )
}

interface ProtocolSceneProps {
  variant: 'intro' | 'burn' | 'airdrops' | 'staking' | 'locks' | 'liquidity' | 'buybacks' | 'flywheel'
}

export function ProtocolScene({ variant }: ProtocolSceneProps) {
  return (
    <div className={`protocol-scene protocol-scene--${variant}`}>
      <Canvas
        dpr={[1, 1.65]}
        camera={variant === 'intro'
          ? { position: [0, 0, 7.7], fov: 43 }
          : { position: [0, 0.15, 8.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.16} />
        {variant === 'intro' && <IntroObject />}
        {variant === 'burn' && <BurnObject />}
        {variant === 'airdrops' && <AirdropObject />}
        {variant === 'staking' && <StakingObject />}
        {variant === 'locks' && <LocksObject />}
        {variant === 'liquidity' && <LiquidityObject />}
        {variant === 'buybacks' && <BuybacksObject />}
        {variant === 'flywheel' && <FlywheelObject />}
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={5.2}
          maxDistance={11}
          rotateSpeed={0.62}
          zoomSpeed={0.6}
          dampingFactor={0.06}
          enableDamping
        />
      </Canvas>
      {variant !== 'intro' && <div className="scene-grid" />}
      {variant === 'intro' && (
        <div className="scene-label scene-label--intro">VALUE /<br />HELD /<br />ON-CHAIN</div>
      )}
      {variant === 'burn' && (
        <>
          <div className="scene-label scene-label--supply">SUPPLY IN</div>
          <div className="scene-label scene-label--void">VOID</div>
        </>
      )}
      {variant === 'airdrops' && (
        <>
          <div className="scene-label scene-label--source">SOURCE</div>
          <div className="scene-label scene-label--wallets">WALLETS</div>
        </>
      )}
      {variant === 'staking' && (
        <>
          <div className="scene-label scene-label--deposit">DEPOSIT</div>
          <div className="scene-core-label">CORE<br />POOL</div>
          <div className="scene-label scene-label--rewards">REWARD<br />FLOW</div>
        </>
      )}
      {variant === 'locks' && (
        <>
          <div className="scene-label scene-label--now">NOW</div>
          <div className="scene-label scene-label--unlock">UNLOCK</div>
        </>
      )}
      {variant === 'liquidity' && (
        <>
          <div className="scene-label scene-label--buy">$BUY</div>
          <div className="scene-label scene-label--eth">SOL</div>
          <div className="scene-core-label">POOL</div>
          <div className="scene-label scene-label--lp">LP</div>
        </>
      )}
      {variant === 'buybacks' && (
        <>
          <div className="scene-label scene-label--revenue">REVENUE</div>
          <div className="scene-core-label">MARKET</div>
          <div className="scene-label scene-label--burn-route">BURN</div>
          <div className="scene-label scene-label--treasury-route">TREASURY</div>
          <div className="scene-label scene-label--lp-route">LP</div>
        </>
      )}
      {variant === 'flywheel' && <div className="scene-core-label flywheel-core-label"><strong>$BUY</strong><span>ECOSYSTEM CORE</span></div>}
      <div className="scene-hint">DRAG TO ROTATE · SCROLL TO SCALE</div>
    </div>
  )
}
