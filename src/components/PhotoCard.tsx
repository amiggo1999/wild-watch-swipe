import { useState, useRef, useEffect } from 'react'
import { ImageData } from '@/types/images'

interface PhotoCardProps {
  imageData: ImageData
  imageUrl: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  nextImageData?: ImageData
  nextImageUrl?: string
  shouldKeepPosition?: boolean // Wenn true, bleibt das Bild außerhalb des sichtbaren Bereichs
}

const SWIPE_THRESHOLD = 100 // Pixel für automatische Entscheidung
const MAX_ROTATION = 30 // Grad

export function PhotoCard({ imageData, imageUrl, onSwipeLeft, onSwipeRight, nextImageData, nextImageUrl, shouldKeepPosition = false }: PhotoCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Reset Position wenn sich das Bild ändert
  useEffect(() => {
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
    setIsAnimating(false)
  }, [imageData.id])

  // Wenn shouldKeepPosition false wird (Toast geschlossen), reset Position
  useEffect(() => {
    if (!shouldKeepPosition && Math.abs(position.x) > SWIPE_THRESHOLD && !isAnimating) {
      resetPosition()
    }
  }, [shouldKeepPosition, position.x, isAnimating])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.current.x
    const deltaY = touch.clientY - startPos.current.y
    
    setPosition({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return
    
    setIsDragging(false)
    
    // Prüfe ob Threshold überschritten wurde
    if (Math.abs(position.x) > SWIPE_THRESHOLD) {
      setIsAnimating(true)
      
      // Entscheidung treffen
      if (position.x > 0 && onSwipeRight) {
        // Swipe nach rechts = Like
        animateOut('right', () => {
          onSwipeRight()
          resetPosition()
        })
      } else if (position.x < 0 && onSwipeLeft) {
        // Swipe nach links = Dislike
        const screenWidth = window.innerWidth
        const targetX = -screenWidth
        
        // Animiere nach links außerhalb
        setPosition({ x: targetX, y: position.y })
        
        // Warte bis Animation fertig ist, dann rufe Handler auf
        setTimeout(() => {
          onSwipeLeft()
          // Position wird NICHT zurückgesetzt, wenn shouldKeepPosition true ist
          if (!shouldKeepPosition) {
            resetPosition()
          }
        }, 300)
      }
    } else {
      // Zurück zum Zentrum
      resetPosition()
    }
  }

  const animateOut = (direction: 'left' | 'right', callback: () => void) => {
    const screenWidth = window.innerWidth
    const targetX = direction === 'right' ? screenWidth : -screenWidth
    
    setPosition({ x: targetX, y: position.y })
    
    setTimeout(() => {
      callback()
    }, 300) // Warte bis Animation fertig ist
  }

  const resetPosition = () => {
    setIsAnimating(true)
    setPosition({ x: 0, y: 0 })
    
    // Warte bis Animation fertig ist
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // Berechne Rotation basierend auf horizontaler Position
  const rotation = (position.x / window.innerWidth) * MAX_ROTATION
  
  // Berechne Opacity basierend auf Entfernung vom Zentrum
  const opacity = Math.max(0.3, 1 - Math.abs(position.x) / (window.innerWidth * 0.5))

  const transform = `translateX(${position.x}px) translateY(${position.y}px) rotate(${rotation}deg)`
  const transition = isAnimating ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'

  // Berechne Opacity für nächstes Bild basierend auf Swipe-Position
  const baseOpacity = 0.15
  const swipeOpacity = Math.min(0.25, Math.abs(position.x) / (window.innerWidth * 0.4))
  const nextImageOpacity = baseOpacity + swipeOpacity
  
  // Scale: Start bei 0.9, wird bei Swipe etwas größer bis 0.92
  const baseScale = 0.9
  const swipeScale = Math.min(0.02, Math.abs(position.x) / (window.innerWidth * 3))
  const nextImageScale = baseScale + swipeScale
  
  // Gaußscher Weichzeichner: Start bei 8px, wird beim Swipen weniger (bis 4px)
  const baseBlur = 8
  const swipeBlur = Math.max(0, 4 - (Math.abs(position.x) / (window.innerWidth * 0.5)))
  const nextImageBlur = baseBlur - swipeBlur

  return (
    <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-32">
      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative">
        {/* Nächstes Bild im Hintergrund */}
        {nextImageData && nextImageUrl && (
          <div
            className="absolute w-full h-full flex items-center justify-center"
            style={{
              opacity: nextImageOpacity,
              transform: `scale(${nextImageScale})`,
              transition: isAnimating ? 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'opacity 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out',
              zIndex: 0,
            }}
          >
            <img
              src={nextImageUrl}
              alt={`Wildlife camera photo: ${nextImageData.label}`}
              className="w-full h-full object-contain rounded-soft shadow-soft pointer-events-none"
              draggable={false}
              style={{
                filter: `blur(${nextImageBlur}px)`,
              }}
            />
          </div>
        )}
        
        {/* Aktuelles Bild */}
        <div
          ref={cardRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full flex items-center justify-center relative"
          style={{
            transform,
            opacity,
            transition,
            touchAction: 'none',
            userSelect: 'none',
            zIndex: 1,
          }}
        >
          <img
            src={imageUrl}
            alt={`Wildlife camera photo: ${imageData.label}`}
            className="w-full h-full object-contain rounded-soft shadow-soft pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}

