'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'

interface AnimatedNumberProps {
  value: number
  format: (n: number) => string
  className?: string
}

export default function AnimatedNumber({ value, format, className = '' }: AnimatedNumberProps) {
  const displayRef = useRef({ value })
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    gsap.to(displayRef.current, {
      value,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayValue(displayRef.current.value)
      },
    })
  }, [value])

  return (
    <span className={className}>
      {format(displayValue)}
    </span>
  )
}
