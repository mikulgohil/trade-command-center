import * as THREE from 'three'

const DEG2RAD = Math.PI / 180

/**
 * Converts latitude/longitude to a 3D position on a sphere.
 * Uses geographic convention: lat=0 at equator, lng=0 at prime meridian.
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD
  const theta = (lng + 180) * DEG2RAD

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}
