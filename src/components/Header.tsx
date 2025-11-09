import logo from '@/assets/wildwatch-logo.png'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
      <div className="max-w-[500px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="WildWatch Logo" 
            className="h-8 w-8 object-contain"
          />
          <h1 className="text-lg font-semibold text-neutral-900">
            WildWatch
          </h1>
        </div>
      </div>
    </header>
  )
}

