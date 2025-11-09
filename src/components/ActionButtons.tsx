import { Button } from '@/components/ui/button'

interface ActionButtonsProps {
  onLike: () => void
  onDislike: () => void
  disabled?: boolean
}

export function ActionButtons({ onLike, onDislike, disabled = false }: ActionButtonsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 bg-white/80 backdrop-blur-md border-t border-neutral-200/50">
      <div className="max-w-[500px] mx-auto w-full">
        <div className="flex items-center justify-center gap-4 w-full">
          <Button
            size="lg"
            variant="outline"
            onClick={onDislike}
            disabled={disabled}
            className="flex-1 h-16 rounded-full border-2 border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 text-3xl max-w-[48%] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Dislike"
          >
            👎
          </Button>
          
          <Button
            size="lg"
            variant="default"
            onClick={onLike}
            disabled={disabled}
            className="flex-1 h-16 rounded-full bg-forest-500 hover:bg-forest-600 focus-visible:ring-2 focus-visible:ring-forest-400 text-3xl max-w-[48%] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Like"
          >
            👍
          </Button>
        </div>
      </div>
    </div>
  )
}

