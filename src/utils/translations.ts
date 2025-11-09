import namesData from '@/assets/names.json'

interface NameTranslation {
  source: string
  deutsch: string
  ähnliche?: string[]
}

// Erstelle eine Map für schnellen Zugriff: source -> deutsch
let translationMap: Map<string, string> | null = null

// Initialisiere die Map mit allen Übersetzungen (lazy initialization)
function getTranslationMap(): Map<string, string> {
  if (!translationMap) {
    translationMap = new Map<string, string>()
    const namesArray = namesData as NameTranslation[]
    
    for (const item of namesArray) {
      translationMap.set(item.source.toLowerCase(), item.deutsch)
    }
  }
  return translationMap
}

/**
 * Übersetzt einen englischen Tiernamen in den deutschen Namen
 * @param englishLabel - Der englische Tiername (z.B. "badger", "fox", "roe deer")
 * @returns Der deutsche Tiername oder der englische Name als Fallback
 */
export function getGermanName(englishLabel: string): string {
  if (!englishLabel) {
    return englishLabel
  }
  
  const map = getTranslationMap()
  const germanName = map.get(englishLabel.toLowerCase())
  return germanName || englishLabel
}

/**
 * Einfache Seeded-Random-Funktion für konsistente Zufälligkeit
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Gibt einen zufälligen Anzeigenamen zurück (echter Name oder ähnlicher Name) mit "?" am Ende
 * @param englishLabel - Der englische Tiername (z.B. "badger", "fox", "roe deer")
 * @param imageId - Die Bild-ID als Seed für konsistente Zufälligkeit
 * @returns Der zufällig gewählte Name mit "?" am Ende
 */
export function getDisplayName(englishLabel: string, imageId: number): string {
  if (!englishLabel) {
    return englishLabel + '?'
  }
  
  const namesArray = namesData as NameTranslation[]
  const labelLower = englishLabel.toLowerCase()
  const nameEntry = namesArray.find(item => item.source.toLowerCase() === labelLower)
  
  if (!nameEntry) {
    // Fallback: Wenn kein Eintrag gefunden, verwende den englischen Namen
    return englishLabel + '?'
  }
  
  const germanName = nameEntry.deutsch
  const similarNames = nameEntry.ähnliche || []
  
  // Wenn keine ähnlichen Namen vorhanden, verwende nur den deutschen Namen
  if (similarNames.length === 0) {
    return germanName + '?'
  }
  
  // Verwende imageId als Seed für konsistente Zufälligkeit
  const seed1 = imageId
  const seed2 = imageId * 7 + 13 // Zweiter Seed für zweite Zufallsentscheidung
  
  // Zufällig entscheiden: echter Name oder ähnlicher Name
  const useRealName = seededRandom(seed1) < 0.5
  
  if (useRealName) {
    return germanName + '?'
  } else {
    // Zufällig einen ähnlichen Namen auswählen
    const randomIndex = Math.floor(seededRandom(seed2) * similarNames.length)
    return similarNames[randomIndex] + '?'
  }
}

