import { Button } from '@/components/ui/button'

interface ActionButtonsProps {
  onLike: () => void
  onDislike: () => void
  disabled?: boolean
}

export function ActionButtons({ onLike, onDislike, disabled = false }: ActionButtonsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 bg-white/90 backdrop-blur-lg border-t border-neutral-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-[500px] mx-auto w-full">
        <div className="flex items-center justify-center gap-4 w-full">
          <Button
            size="lg"
            variant="outline"
            onClick={onDislike}
            disabled={disabled}
            className="flex-1 h-16 rounded-full border-2 border-neutral-300 hover:border-red-400 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 text-3xl max-w-[48%] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-lg group"
            aria-label="Dislike"
          >
            <span className="group-hover:scale-110 transition-transform duration-200 inline-block">👎</span>
          </Button>
          
          <Button
            size="lg"
            variant="default"
            onClick={onLike}
            disabled={disabled}
            className="flex-1 h-16 rounded-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 focus-visible:ring-2 focus-visible:ring-forest-400 text-3xl max-w-[48%] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-xl shadow-lg group"
            aria-label="Like"
          >
            <span className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-200 inline-block">👍</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

