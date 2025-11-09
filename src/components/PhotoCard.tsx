import { ImageData } from '@/types/images'
import { getGermanName } from '@/utils/translations'

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
  
  // Übersetze den Tiernamen ins Deutsche
  const germanName = getGermanName(imageData.label)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20 pb-32">
      {/* Tiername mit Animation */}
      <div className="w-full flex flex-col justify-center mb-6 px-4 animate-fade-in">
        <p className="text-sm md:text-base text-neutral-500 text-center mb-2 font-medium tracking-wide">
          Ist das ein
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center bg-gradient-to-r from-forest-600 to-forest-500 bg-clip-text text-transparent animate-slide-up">
          {germanName}?
        </h2>
      </div>
      
      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center relative">
        {/* Nächstes Bild im Hintergrund mit verbesserter Animation */}
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
        
        {/* Aktuelles Bild mit verbessertem Styling */}
        <div
          className="w-full h-full flex items-center justify-center relative group animate-scale-in"
          style={{
            zIndex: 1,
          }}
        >
          {/* Dekorativer Rahmen/Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest-50/50 via-transparent to-moss-50/30 rounded-soft -z-10 blur-xl opacity-50"></div>
          
          <img
            src={imageUrl}
            alt={`Wildlife camera photo: ${imageData.label}`}
            className="w-full h-full object-contain rounded-soft shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
            draggable={false}
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))',
            }}
          />
          
          {/* Subtiler Glow-Effekt */}
          <div className="absolute inset-0 rounded-soft bg-gradient-to-t from-forest-500/5 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  )
}

