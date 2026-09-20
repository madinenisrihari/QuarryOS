import { useEffect, useState } from 'react'

/**
 * Decides whether it is worth booting WebGL. Falls back to a lightweight CSS visual on
 * devices without WebGL, on low-memory/low-core touch devices, and when Save-Data is on.
 * Returns null until the check has run.
 */
export function useCanRender3D() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
      const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 && window.matchMedia('(pointer: coarse)').matches
      const lowMem = (nav.deviceMemory ?? 8) <= 2
      const saveData = Boolean(nav.connection?.saveData)
      setOk(Boolean(gl) && !lowPower && !lowMem && !saveData)
    } catch {
      setOk(false)
    }
  }, [])
  return ok
}
