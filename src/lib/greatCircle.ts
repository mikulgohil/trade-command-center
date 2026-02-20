import * as THREE from 'three'
import { latLngToVector3 } from './latLngToVector3'
import { ROUTE_ARC_SEGMENTS, ROUTE_ARC_BASE_HEIGHT, ROUTE_ARC_HEIGHT_SCALE } from './constants'

/**
 * Computes points along a great-circle arc between two lat/lng coordinates.
 * Adds a parabolic height offset so routes visually rise above the globe surface.
 */
export function computeGreatCirclePoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  radius: number,
  segments: number = ROUTE_ARC_SEGMENTS
): THREE.Vector3[] {
  const startVec = latLngToVector3(startLat, startLng, 1).normalize()
  const endVec = latLngToVector3(endLat, endLng, 1).normalize()
  const angle = startVec.angleTo(endVec)

  // Longer routes arch higher
  const arcHeight = ROUTE_ARC_BASE_HEIGHT + ROUTE_ARC_HEIGHT_SCALE * (angle / Math.PI)

  const points: THREE.Vector3[] = []
  const tempStart = new THREE.Vector3()
  const tempEnd = new THREE.Vector3()

  for (let i = 0; i <= segments; i++) {
    const t = i / segments

    // Slerp between start and end on unit sphere
    tempStart.copy(startVec)
    tempEnd.copy(endVec)
    const point = tempStart.lerp(tempEnd, t).normalize()

    // Parabolic height offset: peaks at t = 0.5
    const heightOffset = arcHeight * Math.sin(t * Math.PI)
    point.multiplyScalar(radius + heightOffset)

    points.push(point.clone())
  }

  return points
}

/**
 * Creates a CatmullRomCurve3 from great-circle points.
 * The curve provides .getPointAt(t) for uniform-speed particle sampling.
 */
export function createRouteCurve(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  radius: number
): THREE.CatmullRomCurve3 {
  const points = computeGreatCirclePoints(startLat, startLng, endLat, endLng, radius)
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
}
