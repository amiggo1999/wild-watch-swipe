import { ImageData } from '@/types/images'
import { getDisplayName } from '@/utils/translations'

interface PhotoCardProps {
  imageData: ImageData
  imageUrl: string
  nextImageData?: ImageData
  nextImageUrl?: string
}

export function PhotoCard({ imageData, imageUrl, nextImageData, nextImageUrl }: PhotoCardProps) {
  // Statische Werte für nächstes Bild
  const nextImageOpacity = 0.15
  const nextImageScale = 0.9
  const nextImageBlur = 8
  
  // Zufälliger Anzeigename (echter Name oder ähnlicher Name) mit "?"
  const displayName = getDisplayName(imageData.label, imageData.id)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20 pb-32">
      {/* Tiername über dem Bild */}
      <div className="w-full flex justify-center mb-4 px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 text-center">
          {displayName}
        </h2>
      </div>
      
      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative">
        {/* Nächstes Bild im Hintergrund */}
        {nextImageData && nextImageUrl && (
          <div
            className="absolute w-full h-full flex items-center justify-center"
            style={{
              opacity: nextImageOpacity,
              transform: `scale(${nextImageScale})`,
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
          className="w-full h-full flex items-center justify-center relative"
          style={{
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

