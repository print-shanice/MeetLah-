"use client"

import { useState, useRef, useEffect } from "react"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const PRESET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f97316"]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-muted transition-colors"
        title="Change your calendar color"
      >
        <Palette className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Your calendar color</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => {
                  onChange(presetColor)
                  setIsOpen(false)
                }}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                  color === presetColor ? "ring-2 ring-offset-2 ring-foreground" : ""
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
