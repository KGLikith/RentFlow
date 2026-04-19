'use client'

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

export default function OTPInput({ onChange, disabled }: { onChange: (otp: string) => void, disabled?: boolean }) {
  const length = 6
  const [values, setValues] = useState(Array(length).fill(''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const update = (vals: string[]) => {
    setValues(vals)
    onChange(vals.join(''))
  }

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return

    const newVals = [...values]
    newVals[i] = val.slice(-1)
    update(newVals)

    if (val && i < length - 1) {
      inputsRef.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault()

      const newVals = [...values]

      if (values[i]) {
        newVals[i] = ''
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus()
        newVals[i - 1] = ''
      }

      update(newVals)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()

    const paste = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    const newVals = paste.split('')
    while (newVals.length < length) newVals.push('')

    update(newVals)

    inputsRef.current[Math.min(paste.length, length - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {values.map((val, i) => (
        <Input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          className="w-11 h-12 text-center text-lg font-semibold rounded-lg"
          disabled={disabled}
        />
      ))}
    </div>
  )
}