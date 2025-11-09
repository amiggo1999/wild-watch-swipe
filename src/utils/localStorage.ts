const LIKED_IMAGES_KEY = 'wildwatch-liked-images'
const DISLIKED_IMAGES_KEY = 'wildwatch-disliked-images'
const TOAST_SHOWN_KEY = 'wildwatch-toast-shown'

/**
 * Lädt alle gelikten Bild-IDs aus dem Local Storage
 */
export function loadLikedImages(): number[] {
  try {
    const stored = localStorage.getItem(LIKED_IMAGES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed.map(id => Number(id)) : []
    }
  } catch (error) {
    console.error('Fehler beim Laden der gelikten Bilder:', error)
  }
  return []
}

/**
 * Speichert eine neue Like-ID im Local Storage
 */
export function saveLikedImage(imageId: number): void {
  try {
    const likedImages = loadLikedImages()
    if (!likedImages.includes(imageId)) {
      likedImages.push(imageId)
      localStorage.setItem(LIKED_IMAGES_KEY, JSON.stringify(likedImages))
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Like-ID:', error)
  }
}

/**
 * Prüft, ob eine Bild-ID bereits geliked wurde
 */
export function isLiked(imageId: number): boolean {
  const likedImages = loadLikedImages()
  return likedImages.includes(imageId)
}

/**
 * Lädt alle disliked Bild-IDs aus dem Local Storage
 */
export function loadDislikedImages(): number[] {
  try {
    const stored = localStorage.getItem(DISLIKED_IMAGES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed.map(id => Number(id)) : []
    }
  } catch (error) {
    console.error('Fehler beim Laden der disliked Bilder:', error)
  }
  return []
}

/**
 * Speichert eine neue Dislike-ID im Local Storage
 */
export function saveDislikedImage(imageId: number): void {
  try {
    const dislikedImages = loadDislikedImages()
    if (!dislikedImages.includes(imageId)) {
      dislikedImages.push(imageId)
      localStorage.setItem(DISLIKED_IMAGES_KEY, JSON.stringify(dislikedImages))
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Dislike-ID:', error)
  }
}

/**
 * Prüft, ob eine Bild-ID bereits disliked wurde
 */
export function isDisliked(imageId: number): boolean {
  const dislikedImages = loadDislikedImages()
  return dislikedImages.includes(imageId)
}

/**
 * Prüft, ob eine Bild-ID bereits bewertet wurde (geliked oder disliked)
 */
export function isRated(imageId: number): boolean {
  return isLiked(imageId) || isDisliked(imageId)
}

/**
 * Prüft, ob der Toast bereits einmal angezeigt wurde
 */
export function hasToastBeenShown(): boolean {
  try {
    return localStorage.getItem(TOAST_SHOWN_KEY) === 'true'
  } catch (error) {
    return false
  }
}

/**
 * Markiert, dass der Toast bereits angezeigt wurde
 */
export function markToastAsShown(): void {
  try {
    localStorage.setItem(TOAST_SHOWN_KEY, 'true')
  } catch (error) {
    console.error('Fehler beim Speichern des Toast-Flags:', error)
  }
}

/**
 * Setzt alle Listen im Local Storage zurück
 */
export function resetLocalStorage(): void {
  try {
    localStorage.removeItem(LIKED_IMAGES_KEY)
    localStorage.removeItem(DISLIKED_IMAGES_KEY)
    localStorage.removeItem(TOAST_SHOWN_KEY)
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Local Storage:', error)
  }
}


