import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Header } from '@/components/Header'
import { PhotoCard } from '@/components/PhotoCard'
import { ActionButtons } from '@/components/ActionButtons'
import { SplashScreen } from '@/components/SplashScreen'
import { Toast } from '@/components/Toast'
import { ImageData } from '@/types/images'
import imagesData from '@/assets/images.json'
import { saveLikedImage, saveDislikedImage, isLiked, isRated, hasToastBeenShown, markToastAsShown, resetLocalStorage } from '@/utils/localStorage'
import { shuffleArray } from '@/utils/shuffle'

// Dynamische Imports für alle Tierbilder
// Vite's glob gibt relative Pfade zurück
const animalImages = import.meta.glob<string>('/src/assets/animals/*.jpg', { 
  eager: true,
  import: 'default'
})

// Erstelle eine Map für schnelleren Zugriff: ID -> URL
const imageMap = new Map<number, string>()

// Initialisiere die Map mit allen geladenen Bildern
Object.entries(animalImages).forEach(([path, url]) => {
  // Extrahiere die ID aus dem Pfad (z.B. "/src/assets/animals/3.jpg" -> 3)
  const match = path.match(/\/(\d+)\.jpg$/)
  if (match) {
    const id = parseInt(match[1], 10)
    imageMap.set(id, url)
  }
})

function getImageUrl(id: number): string {
  const url = imageMap.get(id)
  return url || ''
}

// 10 verschiedene Confetti-Konfigurationen
const confettiConfigs = [
  // 1. Waldgrün-Theme (von unten)
  {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4ade80', '#22c55e', '#16a34a', '#15803d'],
    gravity: 0.8,
    decay: 0.9,
  },
  // 2. Regenbogen-Burst (von oben)
  {
    particleCount: 150,
    spread: 60,
    origin: { y: 0.2, x: 0.5 },
    colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    gravity: 1.0,
    decay: 0.92,
    angle: 90,
  },
  // 3. Ozean-Blau-Theme (von links)
  {
    particleCount: 120,
    spread: 55,
    origin: { y: 0.5, x: 0 },
    colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
    gravity: 0.7,
    decay: 0.88,
    angle: 45,
  },
  // 4. Sonnenuntergang-Orange/Rot (von rechts)
  {
    particleCount: 130,
    spread: 65,
    origin: { y: 0.5, x: 1 },
    colors: ['#f97316', '#ea580c', '#dc2626', '#ef4444', '#f59e0b'],
    gravity: 0.75,
    decay: 0.91,
    angle: 135,
  },
  // 5. Lila/Violett-Theme (von der Mitte nach außen)
  {
    particleCount: 200,
    spread: 80,
    origin: { y: 0.5, x: 0.5 },
    colors: ['#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#8b5cf6'],
    gravity: 0.6,
    decay: 0.85,
    scalar: 1.2,
  },
  // 6. Gold/Gelb-Feier (von unten, diagonal)
  {
    particleCount: 110,
    spread: 50,
    origin: { y: 0.8, x: 0.5 },
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#facc15', '#eab308'],
    gravity: 0.9,
    decay: 0.93,
    angle: 75,
  },
  // 7. Feuerwerk (mehrere Bursts von der Mitte)
  {
    particleCount: 180,
    spread: 90,
    origin: { y: 0.5, x: 0.5 },
    colors: ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
    gravity: 0.5,
    decay: 0.87,
    scalar: 1.3,
    ticks: 200,
  },
  // 8. Seitlicher Burst links (grün-blaue Mischung)
  {
    particleCount: 140,
    spread: 45,
    origin: { y: 0.4, x: 0.1 },
    colors: ['#10b981', '#059669', '#0d9488', '#14b8a6', '#06b6d4'],
    gravity: 0.65,
    decay: 0.89,
    angle: 30,
  },
  // 9. Seitlicher Burst rechts (rot-pink Mischung)
  {
    particleCount: 140,
    spread: 45,
    origin: { y: 0.4, x: 0.9 },
    colors: ['#f43f5e', '#e11d48', '#be123c', '#ec4899', '#db2777'],
    gravity: 0.65,
    decay: 0.89,
    angle: 150,
  },
  // 10. Multi-Richtungs-Burst (explosionsartig)
  {
    particleCount: 250,
    spread: 100,
    origin: { y: 0.5, x: 0.5 },
    colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
    gravity: 0.4,
    decay: 0.86,
    scalar: 1.5,
    ticks: 250,
  },
]

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [shuffledImages, setShuffledImages] = useState<ImageData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  const [nextImageUrl, setNextImageUrl] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [nextConfettiAt, setNextConfettiAt] = useState(0)
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null)
  const [displayedImageIds, setDisplayedImageIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Lade images.json und filtere bereits bewertete Bilder heraus
    const allImages = imagesData as ImageData[]
    const notRatedImages = allImages.filter(img => !isRated(img.id))
    
    if (notRatedImages.length > 0) {
      const shuffled = shuffleArray(notRatedImages)
      setShuffledImages(shuffled)
    } else {
      // Alle Bilder wurden bewertet, reshuffle alle
      const shuffled = shuffleArray(allImages)
      setShuffledImages(shuffled)
    }
    
    // Initialisiere ersten Confetti-Zeitpunkt zufällig zwischen 3-5 Likes
    const randomInterval = Math.floor(Math.random() * 3) + 3
    setNextConfettiAt(randomInterval)
  }, [])

  useEffect(() => {
    // Lade Bild-URL für aktuelles Foto
    if (shuffledImages.length > 0 && currentIndex < shuffledImages.length) {
      const currentImage = shuffledImages[currentIndex]
      const url = getImageUrl(currentImage.id)
      setCurrentImageUrl(url)
      
      // Markiere Bild als angezeigt
      setDisplayedImageIds(prev => new Set(prev).add(currentImage.id))
    }
  }, [shuffledImages, currentIndex])

  useEffect(() => {
    // Lade nächstes Bild für Preview
    if (shuffledImages.length > 0) {
      // Finde das nächste noch nicht angezeigte und nicht bewertete Bild
      let nextIndex: number | null = null
      for (let i = currentIndex + 1; i < shuffledImages.length; i++) {
        const imageId = shuffledImages[i].id
        if (!displayedImageIds.has(imageId) && !isRated(imageId)) {
          nextIndex = i
          break
        }
      }
      if (nextIndex === null) {
        for (let i = 0; i < currentIndex; i++) {
          const imageId = shuffledImages[i].id
          if (!displayedImageIds.has(imageId) && !isRated(imageId)) {
            nextIndex = i
            break
          }
        }
      }
      
      if (nextIndex !== null && nextIndex < shuffledImages.length) {
        const nextImage = shuffledImages[nextIndex]
        const nextUrl = getImageUrl(nextImage.id)
        setNextImageUrl(nextUrl)
      } else {
        setNextImageUrl('')
      }
    }
  }, [shuffledImages, currentIndex, displayedImageIds])

  const getNextImageIndex = (): number | null => {
    // Finde das nächste noch nicht angezeigte und nicht bewertete Bild
    for (let i = currentIndex + 1; i < shuffledImages.length; i++) {
      const imageId = shuffledImages[i].id
      if (!displayedImageIds.has(imageId) && !isRated(imageId)) {
        return i
      }
    }
    // Wenn kein Bild mehr gefunden wurde, suche von vorne
    for (let i = 0; i < currentIndex; i++) {
      const imageId = shuffledImages[i].id
      if (!displayedImageIds.has(imageId) && !isRated(imageId)) {
        return i
      }
    }
    return null
  }

  const checkAndResetIfAllSeen = (): boolean => {
    const allImages = imagesData as ImageData[]
    const allSeen = allImages.every(img => displayedImageIds.has(img.id))
    
    if (allSeen) {
      resetLocalStorage()
      setDisplayedImageIds(new Set())
      return true
    }
    return false
  }

  const triggerConfetti = () => {
    // Wähle zufällig eine der 10 Konfigurationen
    const randomConfig = confettiConfigs[Math.floor(Math.random() * confettiConfigs.length)]
    
    confetti(randomConfig)
  }

  const handleLike = () => {
    if (shuffledImages.length > 0 && currentIndex < shuffledImages.length) {
      const currentImage = shuffledImages[currentIndex]
      saveLikedImage(currentImage.id)
      setDisplayedImageIds(prev => new Set(prev).add(currentImage.id))
    }

    const newLikeCount = likeCount + 1
    
    // Zeige Confetti alle 3-5 mal (zufällig)
    if (newLikeCount >= nextConfettiAt) {
      triggerConfetti()
      // Setze nächsten Confetti-Zeitpunkt zufällig zwischen 3-5 Likes
      const randomInterval = Math.floor(Math.random() * 3) + 3
      setNextConfettiAt(newLikeCount + randomInterval)
    }
    
    setLikeCount(newLikeCount)

    if (checkAndResetIfAllSeen()) {
      const allImages = imagesData as ImageData[]
      const reshuffled = shuffleArray(allImages)
      setShuffledImages(reshuffled)
      setCurrentIndex(0)
      return
    }

    const nextIndex = getNextImageIndex()
    if (nextIndex !== null) {
      setCurrentIndex(nextIndex)
    } else {
      const allImages = imagesData as ImageData[]
      const notRatedImages = allImages.filter(img => !isRated(img.id))
      if (notRatedImages.length > 0) {
        const reshuffled = shuffleArray(notRatedImages)
        setShuffledImages(reshuffled)
        setDisplayedImageIds(new Set())
        setCurrentIndex(0)
      }
    }
  }

  const handleDislike = () => {
    if (shuffledImages.length > 0 && currentIndex < shuffledImages.length) {
      const currentImage = shuffledImages[currentIndex]
      saveDislikedImage(currentImage.id)
      setDisplayedImageIds(prev => new Set(prev).add(currentImage.id))
    }

    const shouldShowToast = !hasToastBeenShown()
    if (shouldShowToast) {
      setShowToast(true)
      markToastAsShown()
    }

    if (checkAndResetIfAllSeen()) {
      const allImages = imagesData as ImageData[]
      const reshuffled = shuffleArray(allImages)
      setShuffledImages(reshuffled)
      if (shouldShowToast) {
        setPendingNextIndex(0)
      } else {
        setCurrentIndex(0)
      }
      return
    }

    const nextIndex = getNextImageIndex()
    if (nextIndex !== null) {
      if (shouldShowToast) {
        setPendingNextIndex(nextIndex)
      } else {
        setCurrentIndex(nextIndex)
      }
    } else {
      const allImages = imagesData as ImageData[]
      const notRatedImages = allImages.filter(img => !isRated(img.id))
      if (notRatedImages.length > 0) {
        const reshuffled = shuffleArray(notRatedImages)
        setShuffledImages(reshuffled)
        setDisplayedImageIds(new Set())
        if (shouldShowToast) {
          setPendingNextIndex(0)
        } else {
          setCurrentIndex(0)
        }
      } else {
        if (shouldShowToast) {
          setPendingNextIndex(null)
        }
      }
    }
  }

  const handleToastClose = () => {
    setShowToast(false)
    // Wechsle zum nächsten Bild, nachdem Toast geschlossen wurde
    if (pendingNextIndex !== null) {
      setCurrentIndex(pendingNextIndex)
      setPendingNextIndex(null)
    }
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (shuffledImages.length === 0 || !currentImageUrl) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-neutral-500">Lade Fotos...</div>
      </div>
    )
  }

  const currentImage = shuffledImages[currentIndex]
  const imageIsLiked = currentImage ? isLiked(currentImage.id) : false
  
  // Finde nächstes Bild für Preview
  const nextImageIndex = getNextImageIndex()
  const nextImage = nextImageIndex !== null && nextImageIndex < shuffledImages.length 
    ? shuffledImages[nextImageIndex] 
    : undefined

  return (
    <div className="h-screen w-full flex items-center justify-center bg-neutral-50 app-wrapper">
      <div className="h-full w-full max-w-[500px] flex flex-col overflow-hidden bg-neutral-50 app-container">
        <Header />
        <PhotoCard 
          imageData={currentImage} 
          imageUrl={currentImageUrl}
          nextImageData={nextImage}
          nextImageUrl={nextImageUrl}
        />
        <ActionButtons 
          onLike={handleLike}
          onDislike={handleDislike}
        />
        {showToast && (
          <Toast
            title="Danke für dein Feedback"
            message="Es hilft uns, unser KI-Modell zu verbessern und mehr Wildtiere zu schützen."
            onClose={handleToastClose}
          />
        )}
      </div>
    </div>
  )
}

export default App

