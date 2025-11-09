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
    // Confetti-Animation mit Waldgrün-Farben
    const colors = ['#4ade80', '#22c55e', '#16a34a', '#15803d'] // Grüntöne
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      gravity: 0.8,
      decay: 0.9,
    })
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

