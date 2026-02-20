'use client'

export default function Lighting() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.35} />

      {/* Key light — upper-left */}
      <directionalLight position={[-5, 5, 3]} intensity={1.1} />

      {/* Fill light — front */}
      <directionalLight position={[0, 0, 5]} intensity={0.35} />

      {/* Rim/back light — gives premium edge */}
      <directionalLight position={[3, -2, -5]} intensity={0.7} />
    </>
  )
}
