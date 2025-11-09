import { useEffect, useState } from 'react'

interface ToastProps {
  title: string
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ title, message, onClose, duration = 2500 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Progress-Bar Animation von 0% auf 100% (von links nach rechts)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        // Erhöhe um 2% alle 50ms (für smooth Animation)
        return prev + (100 / (duration / 50))
      })
    }, 50)

    // Zeige Toast für die angegebene Dauer
    const timer = setTimeout(() => {
      setOpacity(0)
      setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 300) // Fade-out Dauer
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] px-5 py-4 bg-white rounded-soft shadow-soft border border-neutral-200 w-[80%] max-w-md mx-auto transition-opacity duration-300"
      style={{ opacity }}
    >
      <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-700 leading-relaxed text-center mb-3">
        {message}
      </p>
      {/* Progress-Bar */}
      <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-forest-500 rounded-full transition-all duration-50 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

