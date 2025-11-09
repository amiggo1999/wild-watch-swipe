import { useState, useEffect } from 'react'
import logo from '@/assets/wildwatch-logo.png'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Schnellerer Ladevorgang: 0.8 Sekunden insgesamt
    const totalDuration = 800
    const fadeOutStart = 600 // Starte Fade-out nach 600ms
    
    // Ladebalken-Animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, totalDuration / 50) // 50 Schritte für smooth Animation

    // Fade-out Timer
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0)
      setTimeout(() => {
        setIsVisible(false)
        onComplete()
      }, 200) // Schnelleres Fade-out
    }, fadeOutStart)

    return () => {
      clearTimeout(fadeOutTimer)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-50 transition-opacity duration-200"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-xs px-8">
        <img 
          src={logo} 
          alt="WildWatch Logo" 
          className="h-20 w-20 object-contain"
        />
        
        {/* Ladebalken */}
        <div className="w-full">
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-forest-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

