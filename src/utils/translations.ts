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

