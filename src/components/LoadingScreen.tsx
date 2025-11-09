import { useState, useEffect } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

// Verschiedene Tannengrüntöne
const pineGreenColors = [
  '#2d5016', // Dunkles Tannengrün
  '#3d6b1f', // Mittleres Tannengrün
  '#4d7a28', // Helles Tannengrün
  '#1e3a0f', // Sehr dunkles Tannengrün
]

// SVG für eine Tierpfote mit unterschiedlicher Farbe
const PawPrint = ({ color, delay = 0 }: { color: string; delay?: number }) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="paw-print"
    style={{
      animationDelay: `${delay}s`,
    }}
  >
    {/* Hauptballen */}
    <ellipse cx="30" cy="35" rx="12" ry="10" fill={color} opacity="0.8" />
    {/* Vier Zehenballen */}
    <ellipse cx="18" cy="20" rx="6" ry="5" fill={color} opacity="0.8" />
    <ellipse cx="30" cy="15" rx="6" ry="5" fill={color} opacity="0.8" />
    <ellipse cx="42" cy="20" rx="6" ry="5" fill={color} opacity="0.8" />
    <ellipse cx="35" cy="25" rx="5" ry="4" fill={color} opacity="0.8" />
  </svg>
)

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    // 2 Sekunden Ladevorgang
    const totalDuration = 2000
    const fadeOutStart = 1800 // Starte Fade-out nach 1.8 Sekunden

    // Fade-out Timer
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0)
      setTimeout(() => {
        setIsVisible(false)
        onComplete()
      }, 200)
    }, fadeOutStart)

    return () => {
      clearTimeout(fadeOutTimer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 transition-opacity duration-200"
      style={{ opacity }}
    >
      <style>{`
        @keyframes pawBounce {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1) translateY(-10px);
          }
        }
        
        .paw-print {
          animation: pawBounce 1.2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="flex items-center justify-center gap-4">
        <PawPrint color={pineGreenColors[0]} delay={0} />
        <PawPrint color={pineGreenColors[1]} delay={0.2} />
        <PawPrint color={pineGreenColors[2]} delay={0.4} />
        <PawPrint color={pineGreenColors[3]} delay={0.6} />
      </div>
    </div>
  )
}

