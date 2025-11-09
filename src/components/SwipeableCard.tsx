import { useState, useRef, useEffect } from 'react'
import { ImageData } from '@/types/images'
import { getGermanName } from '@/utils/translations'

interface SwipeableCardProps {
  imageData: ImageData
  imageUrl: string
  nextImageData?: ImageData
  nextImageUrl?: string
  onSwipeLeft: () => void  // Dislike
  onSwipeRight: () => void // Like
  disabled?: boolean
}

export function SwipeableCard({ 
  imageData, 
  imageUrl, 
  nextImageData, 
  nextImageUrl,
  onSwipeLeft,
  onSwipeRight,
  disabled = false
}: SwipeableCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [opacity, setOpacity] = useState(1)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startTime = useRef(0)
  const isDraggingRef = useRef(false)
  
  const nextImageOpacity = 0.15
  const nextImageScale = 0.9
  const nextImageBlur = 8
  const germanName = getGermanName(imageData.label)
  
  // Swipe-Schwellenwerte
  const MINIMUM_SWIPE_DISTANCE = 20 // Mindest-Distanz in Pixel, bevor Swipe akzeptiert wird
  const SWIPE_THRESHOLD = 100 // Mindest-Distanz für vollständigen Swipe
  const ROTATION_FACTOR = 0.1 // Rotation basierend auf X-Position
  
  const handleStart = (clientX: number, clientY: number) => {
    if (disabled) return
    setIsDragging(true)
    isDraggingRef.current = true
    startPos.current = { x: clientX, y: clientY }
    startTime.current = Date.now()
    setPosition({ x: 0, y: 0 })
    setRotation(0)
    setOpacity(1)
  }
  
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || disabled) return
    
    const deltaX = clientX - startPos.current.x
    const deltaY = clientY - startPos.current.y
    
    setPosition({ x: deltaX, y: deltaY })
    setRotation(deltaX * ROTATION_FACTOR)
    
    // Opacity basierend auf Distanz
    const distance = Math.abs(deltaX)
    const maxDistance = 200
    setOpacity(1 - Math.min(distance / maxDistance, 0.5))
  }
  
  const handleEnd = () => {
    if (!isDraggingRef.current || disabled) {
      return
    }
    
    // Verwende den aktuellen State-Wert
    setPosition(currentPos => {
      const distance = Math.abs(currentPos.x)
      const timeElapsed = Math.max(Date.now() - startTime.current, 1)
      const velocity = distance / timeElapsed * 1000
      
      // Prüfe zuerst, ob Mindest-Distanz erreicht wurde
      if (distance < MINIMUM_SWIPE_DISTANCE) {
        // Zu wenig Bewegung - zurück zur Mitte springen
        setIsDragging(false)
        isDraggingRef.current = false
        animateBackToCenter()
        return currentPos
      }
      
      // Swipe erkannt wenn Distanz > Threshold oder schnelle Bewegung
      if (distance > SWIPE_THRESHOLD || velocity > 0.5) {
        // Warte kurz, damit das Bild noch sichtbar ist, bevor die Animation startet
        setIsDragging(false)
        isDraggingRef.current = false
        
        // Starte Animation von aktueller Position
        setTimeout(() => {
          if (currentPos.x > 0) {
            // Swipe nach rechts = Like
            animateSwipeOut('right', onSwipeRight, currentPos)
          } else {
            // Swipe nach links = Dislike
            animateSwipeOut('left', onSwipeLeft, currentPos)
          }
        }, 10) // Kurze Verzögerung für flüssigere Animation
      } else {
        // Zurück zur Mitte
        setIsDragging(false)
        isDraggingRef.current = false
        animateBackToCenter()
      }
      
      return currentPos
    })
  }
  
  const handleCancel = () => {
    // Touch wurde abgebrochen (z.B. durch Scroll)
    if (isDraggingRef.current) {
      resetPosition()
      setIsDragging(false)
      isDraggingRef.current = false
    }
  }
  
  const animateSwipeOut = (direction: 'left' | 'right', callback: () => void, startPosition: { x: number; y: number }) => {
    const targetX = direction === 'right' ? window.innerWidth * 1.5 : -window.innerWidth * 1.5
    const duration = 300
    
    // Verwende die übergebene Startposition (aktuelle Position beim Swipe)
    const startX = startPosition.x
    const startY = startPosition.y
    const animStartTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - animStartTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const currentX = startX + (targetX - startX) * easeOut
      setPosition({ x: currentX, y: startY })
      setRotation(currentX * ROTATION_FACTOR)
      setOpacity(1 - progress * 0.8) // Behalte etwas Opacity für flüssigere Animation
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        callback()
        resetPosition()
      }
    }
    
    requestAnimationFrame(animate)
  }
  
  const resetPosition = () => {
    setPosition({ x: 0, y: 0 })
    setRotation(0)
    setOpacity(1)
  }
  
  const animateBackToCenter = () => {
    // Hole aktuelle Position für flüssige Animation zurück zur Mitte
    setPosition(currentPos => {
      const startX = currentPos.x
      const startY = currentPos.y
      const startRotation = rotation
      const startOpacity = opacity
      const animStartTime = Date.now()
      const duration = 300 // 300ms für flüssige Animation
      
      const animate = () => {
        const elapsed = Date.now() - animStartTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out für natürliche Bewegung
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        const currentX = startX * (1 - easeOut)
        const currentY = startY * (1 - easeOut)
        const currentRotation = startRotation * (1 - easeOut)
        const currentOpacity = startOpacity + (1 - startOpacity) * easeOut
        
        setPosition({ x: currentX, y: currentY })
        setRotation(currentRotation)
        setOpacity(currentOpacity)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Stelle sicher, dass wir genau bei 0,0,0,1 sind
          resetPosition()
        }
      }
      
      requestAnimationFrame(animate)
      return currentPos
    })
  }
  
  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Nur den ersten Touch verarbeiten (Multi-Touch ignorieren)
    if (e.touches.length === 1 && !isDraggingRef.current) {
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    }
  }
  
  // Mouse Event Handlers (für Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY)
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY)
    }
  }
  
  const handleMouseUp = () => {
    handleEnd()
  }
  
  // Touch Event Listener mit passive: false für preventDefault
  useEffect(() => {
    const cardElement = cardRef.current
    if (!cardElement) return
    
    const handleTouchMovePassive = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) {
        return
      }
      
      // Verhindere Scroll nur wenn wir tatsächlich swipen
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - startPos.current.x)
      const deltaY = Math.abs(touch.clientY - startPos.current.y)
      
      // Nur preventDefault wenn horizontale Bewegung größer als vertikale (Swipe, nicht Scroll)
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault()
      }
      
      handleMove(touch.clientX, touch.clientY)
    }
    
    const handleTouchEndPassive = (e: TouchEvent) => {
      // Nur verarbeiten wenn es der letzte Touch ist
      if (e.touches.length === 0 && isDraggingRef.current) {
        handleEnd()
      }
    }
    
    const handleTouchCancelPassive = () => {
      handleCancel()
    }
    
    // Registriere Touch-Events mit passive: false
    cardElement.addEventListener('touchmove', handleTouchMovePassive, { passive: false })
    cardElement.addEventListener('touchend', handleTouchEndPassive, { passive: false })
    cardElement.addEventListener('touchcancel', handleTouchCancelPassive, { passive: false })
    
    return () => {
      cardElement.removeEventListener('touchmove', handleTouchMovePassive)
      cardElement.removeEventListener('touchend', handleTouchEndPassive)
      cardElement.removeEventListener('touchcancel', handleTouchCancelPassive)
    }
  }, [])
  
  // Mouse Event Listener für Desktop
  useEffect(() => {
    if (!isDragging) return
    
    const handleGlobalMouseUp = () => {
      handleEnd()
    }
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }
    
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])
  
  // Visual Feedback für Swipe-Richtung
  const getSwipeIndicator = () => {
    if (!isDragging || Math.abs(position.x) < 50) return null
    
    const isRight = position.x > 0
    const intensity = Math.min(Math.abs(position.x) / SWIPE_THRESHOLD, 1)
    
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-200 rounded-soft ${
          isRight ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}
        style={{ opacity: intensity * 0.8 }}
      >
        <div className={`text-6xl font-bold ${
          isRight ? 'text-green-500' : 'text-red-500'
        }`} style={{ opacity: intensity }}>
          {isRight ? '👍' : '👎'}
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20 pb-32">
      {/* Tiername */}
      <div className="w-full flex flex-col justify-center mb-6 px-4 animate-fade-in">
        <p className="text-sm md:text-base text-neutral-500 text-center mb-2 font-medium tracking-wide">
          Ist das ein
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center bg-gradient-to-r from-forest-600 to-forest-500 bg-clip-text text-transparent animate-slide-up">
          {germanName}?
        </h2>
      </div>
      
      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative">
        {/* Nächstes Bild im Hintergrund */}
        {nextImageData && nextImageUrl && (
          <div
            className="absolute w-full h-full flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              opacity: nextImageOpacity,
              transform: `scale(${nextImageScale})`,
              zIndex: 0,
            }}
          >
            <img
              src={nextImageUrl}
              alt={`Wildlife camera photo: ${nextImageData.label}`}
              className="w-full h-full object-contain rounded-soft shadow-soft pointer-events-none transition-all duration-500"
              draggable={false}
              style={{
                filter: `blur(${nextImageBlur}px)`,
              }}
            />
          </div>
        )}
        
        {/* Swipeable Card Container */}
        <div
          ref={cardRef}
          className="w-full h-full flex items-center justify-center relative group cursor-grab active:cursor-grabbing"
          style={{
            zIndex: 1,
            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
            opacity: opacity,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchCancel={handleCancel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Dekorativer Rahmen/Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest-50/50 via-transparent to-moss-50/30 rounded-soft -z-10 blur-xl opacity-50"></div>
          
          <img
            src={imageUrl}
            alt={`Wildlife camera photo: ${imageData.label}`}
            className="w-full h-full object-contain rounded-soft shadow-lg select-none"
            draggable={false}
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))',
              userSelect: 'none',
            }}
          />
          
          {/* Subtiler Glow-Effekt */}
          <div className="absolute inset-0 rounded-soft bg-gradient-to-t from-forest-500/5 to-transparent pointer-events-none"></div>
          
          {/* Swipe Indicator Overlay */}
          {getSwipeIndicator()}
        </div>
      </div>
    </div>
  )
}

