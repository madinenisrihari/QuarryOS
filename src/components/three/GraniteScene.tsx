import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, type Group } from 'three'
import type { GraniteType } from '@/types/models'
import { graniteRoughness, makeGraniteTextures } from './graniteTexture'

export interface GraniteSceneProps {
  type: GraniteType
  /** length, width, height in feet */
  dims: [number, number, number]
  interactive?: boolean
  autoRotate?: boolean
  pointerParallax?: boolean
  paused?: boolean
  reducedMotion?: boolean
  seed?: number
}

function Block({ type, dims, autoRotate, pointerParallax, reducedMotion, seed = 11 }: GraniteSceneProps) {
  const group = useRef<Group>(null)
  const spin = useRef(-0.55)
  const textures = useMemo(() => makeGraniteTextures(type, 1024, seed), [type, seed])
  useEffect(() => () => { textures.map.dispose(); textures.bumpMap.dispose() }, [textures])

  const k = 3.3 / dims[0]                 // fit the longest edge to a fixed scene size
  const size: [number, number, number] = [dims[0] * k, dims[2] * k, dims[1] * k]

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    if (autoRotate && !reducedMotion) spin.current += dt * 0.14
    const px = pointerParallax && !reducedMotion ? state.pointer.x : 0
    const py = pointerParallax && !reducedMotion ? state.pointer.y : 0
    g.rotation.y = MathUtils.damp(g.rotation.y, spin.current + px * 0.35, 3.2, dt)
    g.rotation.x = MathUtils.damp(g.rotation.x, -py * 0.09, 3.2, dt)
  })

  return (
    <group ref={group} position={[0, size[1] / 2 - 1.05, 0]}>
      <RoundedBox args={size} radius={0.045} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial map={textures.map} bumpMap={textures.bumpMap} bumpScale={0.6} roughness={graniteRoughness(type)} metalness={0.08} clearcoat={0.55} clearcoatRoughness={0.32} envMapIntensity={1.05} />
      </RoundedBox>
    </group>
  )
}

export default function GraniteScene(props: GraniteSceneProps) {
  const { interactive, paused } = props
  return (
    <Canvas
      shadows dpr={[1, 1.75]} camera={{ position: [4.9, 2.5, 5.6], fov: 30 }}
      frameloop={paused ? 'never' : 'always'} gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      aria-label="3D granite block" style={{ touchAction: interactive ? 'none' : 'pan-y' }}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-near={1} shadow-camera-far={16} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0004} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -2]} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={1.3} position={[-5, 1.5, 3]} rotation-y={Math.PI / 2} scale={[7, 2.5, 1]} color="#ffe9c4" />
        <Lightformer form="rect" intensity={0.9} position={[5, 0.5, 3]} rotation-y={-Math.PI / 2} scale={[7, 2, 1]} color="#cfe3ff" />
      </Environment>
      {/* plinth */}
      <mesh position={[0, -1.14, 0]} receiveShadow>
        <cylinderGeometry args={[3.1, 3.1, 0.12, 96]} />
        <meshStandardMaterial color="#17191c" roughness={0.75} metalness={0.2} />
      </mesh>
      <Block {...props} />
      <ContactShadows position={[0, -1.07, 0]} opacity={0.6} scale={11} blur={2.6} far={3.4} />
      {interactive && <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.9} maxPolarAngle={1.6} rotateSpeed={0.7} />}
    </Canvas>
  )
}
