import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import CompassLogo from '../ui/CompassLogo'

const navLinks = [
  { to: '/assessment', label: 'Assessment' },
  { to: '/careers', label: 'Career Finder' },
  { to: '/courses', label: 'Course Finder' },
  { to: '/universities', label: 'Uni Finder' },
  { to: '/methodology', label: 'Methodology' },
]

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const lastId = JSON.parse(localStorage.getItem('compass_assessment') || 'null')?.assessmentId

  return (
    <>
      <nav style={{ background: '#013147' }} className="sticky top-0 z-50 h-16 flex items-center shadow-md">
        <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white no-underline">
            <CompassLogo size={32} />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>
              Compass
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => isActive
                  ? { background: '#229ebc', color: '#fff', borderRadius: '10px', padding: '7px 15px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }
                  : { color: '#8ec9e6', borderRadius: '10px', padding: '7px 15px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }
                }
                className={({ isActive }) => !isActive ? 'hover:text-white transition-colors' : ''}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Career Builder CTA + Admin + hamburger */}
          <div className="flex items-center gap-2">
            {lastId && (
              <Link
                to={`/career-builder/${lastId}`}
                style={{ background: 'linear-gradient(135deg, #ffb705, #ffd041)', color: '#013147', fontSize: '12px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, borderRadius: 10, padding: '7px 13px', textDecoration: 'none' }}
                className="hidden md:inline-flex items-center gap-1.5"
              >
                🗺️ Career Builder
              </Link>
            )}
            <Link
              to="/admin"
              style={{ color: '#8ec9e6', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
              className="hidden md:block px-3 py-1.5 rounded hover:text-white transition-colors"
            >
              Admin
            </Link>
            <button
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200]" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(1,49,71,0.7)' }} />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 flex flex-col shadow-2xl"
            style={{ background: '#013147' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(142,201,230,0.2)' }}>
              <div className="flex items-center gap-2">
                <CompassLogo size={28} />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 17, color: '#fff' }}>Compass</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-white/70 hover:text-white p-1">
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  style={({ isActive }) => isActive
                    ? { background: '#229ebc', color: '#fff', borderRadius: '10px', padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontWeight: 600, textDecoration: 'none', display: 'block' }
                    : { color: '#8ec9e6', borderRadius: '10px', padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontWeight: 500, textDecoration: 'none', display: 'block' }
                  }
                  className={({ isActive }) => !isActive ? 'hover:text-white hover:bg-white/10 transition-colors' : ''}
                >
                  {link.label}
                </NavLink>
              ))}
              {lastId && (
                <Link
                  to={`/career-builder/${lastId}`}
                  onClick={() => setDrawerOpen(false)}
                  style={{ background: 'linear-gradient(135deg, #ffb705, #ffd041)', color: '#013147', borderRadius: '10px', padding: '12px 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textDecoration: 'none', display: 'block', marginTop: '8px', fontSize: '14px' }}
                >
                  🗺️ Career Builder
                </Link>
              )}
              <Link
                to="/admin"
                onClick={() => setDrawerOpen(false)}
                style={{ color: 'rgba(142,201,230,0.5)', fontSize: '13px', padding: '12px 16px', fontFamily: 'Inter, sans-serif', textDecoration: 'none', display: 'block', marginTop: '8px' }}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
