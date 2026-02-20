/**
 * Synthesized sound effects using Web Audio API.
 * No external audio files needed — all sounds generated programmatically.
 */

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let ambientOsc: OscillatorNode | null = null
let ambientGain: GainNode | null = null
let isMuted = false
let isInitialized = false

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.3
    masterGain.connect(ctx.destination)
  }
  return ctx
}

function getMasterGain(): GainNode {
  getContext()
  return masterGain!
}

/** Must be called from a user gesture to unlock AudioContext */
export function initSounds(): void {
  if (isInitialized) return
  const c = getContext()
  if (c.state === 'suspended') c.resume()

  // Restore mute state from localStorage
  const stored = typeof window !== 'undefined' ? localStorage.getItem('dp-sound-muted') : null
  if (stored === 'true') {
    isMuted = true
    getMasterGain().gain.value = 0
  }

  isInitialized = true
}

export function toggleMute(): boolean {
  isMuted = !isMuted
  getMasterGain().gain.setTargetAtTime(isMuted ? 0 : 0.3, getContext().currentTime, 0.05)
  if (typeof window !== 'undefined') {
    localStorage.setItem('dp-sound-muted', String(isMuted))
  }
  return isMuted
}

export function getIsMuted(): boolean {
  return isMuted
}

/** Ambient hum — low drone that runs continuously */
export function startAmbient(): void {
  if (ambientOsc) return
  const c = getContext()
  const gain = getMasterGain()

  ambientGain = c.createGain()
  ambientGain.gain.value = 0.06

  // Low drone oscillator
  ambientOsc = c.createOscillator()
  ambientOsc.type = 'sine'
  ambientOsc.frequency.value = 55 // Low A

  // Second harmonic for richness
  const osc2 = c.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 82.5 // Fifth above

  const osc2Gain = c.createGain()
  osc2Gain.gain.value = 0.03

  // Low-pass filter for warmth
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  filter.Q.value = 1

  ambientOsc.connect(filter)
  osc2.connect(osc2Gain)
  osc2Gain.connect(filter)
  filter.connect(ambientGain)
  ambientGain.connect(gain)

  ambientOsc.start()
  osc2.start()
}

export function stopAmbient(): void {
  if (ambientOsc) {
    ambientOsc.stop()
    ambientOsc = null
  }
  ambientGain = null
}

/** Short ping — info events, port selections */
export function playPing(): void {
  if (!isInitialized) return
  const c = getContext()
  const gain = getMasterGain()
  const now = c.currentTime

  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1200, now)
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.15)

  const g = c.createGain()
  g.gain.setValueAtTime(0.12, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(g)
  g.connect(gain)
  osc.start(now)
  osc.stop(now + 0.35)
}

/** Camera fly-to whoosh */
export function playWhoosh(): void {
  if (!isInitialized) return
  const c = getContext()
  const gain = getMasterGain()
  const now = c.currentTime

  // White noise burst filtered through bandpass
  const bufferSize = c.sampleRate * 0.6
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const source = c.createBufferSource()
  source.buffer = buffer

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(400, now)
  filter.frequency.exponentialRampToValueAtTime(1200, now + 0.2)
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.5)
  filter.Q.value = 2

  const g = c.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(0.15, now + 0.1)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

  source.connect(filter)
  filter.connect(g)
  g.connect(gain)
  source.start(now)
}

/** Disruption alert — urgent two-tone */
export function playAlert(): void {
  if (!isInitialized) return
  const c = getContext()
  const gain = getMasterGain()
  const now = c.currentTime

  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.2
    const osc = c.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 660, t)

    const g = c.createGain()
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)

    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000

    osc.connect(filter)
    filter.connect(g)
    g.connect(gain)
    osc.start(t)
    osc.stop(t + 0.18)
  }
}

/** Warning tone — softer than alert */
export function playWarning(): void {
  if (!isInitialized) return
  const c = getContext()
  const gain = getMasterGain()
  const now = c.currentTime

  const osc = c.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.4)

  const g = c.createGain()
  g.gain.setValueAtTime(0.1, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

  osc.connect(g)
  g.connect(gain)
  osc.start(now)
  osc.stop(now + 0.55)
}

/** Prediction resolve — ascending chime */
export function playResolve(): void {
  if (!isInitialized) return
  const c = getContext()
  const gain = getMasterGain()
  const now = c.currentTime

  const notes = [523, 659, 784] // C5, E5, G5
  notes.forEach((freq, i) => {
    const t = now + i * 0.08
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const g = c.createGain()
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)

    osc.connect(g)
    g.connect(gain)
    osc.start(t)
    osc.stop(t + 0.35)
  })
}
