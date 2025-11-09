import logo from '@/assets/wildwatch-logo.png'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/90 backdrop-blur-lg border-b border-neutral-200/50 shadow-sm">
      <div className="max-w-[500px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img 
              src={logo} 
              alt="WildWatch Logo" 
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-forest-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h1 className="text-lg font-bold text-neutral-900 bg-gradient-to-r from-forest-700 to-forest-600 bg-clip-text text-transparent">
            WildWatch
          </h1>
        </div>
      </div>
    </header>
  )
}

