import { Link, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()
  const isLanding    = pathname === '/'

  return (
    <header className="sticky top-0 z-50 border-b border-edge/50 bg-ink/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
            <Zap size={16} className="text-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg text-text-primary tracking-tight">
            Credify<span className="text-lime"> AI</span>
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {!isLanding && (
            <Link to="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              ← Home
            </Link>
          )}
          {isLanding && (
            <Link to="/apply" className="btn-primary text-sm py-2 px-4">
              Check Eligibility
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
