'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette darkness={0.5} offset={0.3} />
    </EffectComposer>
  )
}
