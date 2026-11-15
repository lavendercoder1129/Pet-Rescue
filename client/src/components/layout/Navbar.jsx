import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { HeartHandshake, Menu, X, ShieldCheck, Heart } from 'lucide-react';
import Container from './Container';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Emergency Cases', path: '/cases' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Transparency', path: '/transparency' },
    { label: 'Donor Wall', path: '/donor-wall' },
  ];

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-grey-light transition-all">
      <Container>
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" onClick={closeMobile} className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center text-ivory shadow-warm-sm group-hover:bg-forest-light transition-colors">
              <HeartHandshake className="w-6 h-6 text-sage-light" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-forest block leading-none">
                Pet Rescue
              </span>
              <span className="text-[11px] font-sans text-charcoal-muted uppercase tracking-widest block mt-1 font-medium">
                Emergency Stray Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-7 text-sm font-medium">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? 'text-forest font-semibold'
                      : 'text-charcoal-muted hover:text-forest'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-forest rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/design-system"
              className="text-xs px-2.5 py-1 rounded-md text-charcoal-muted hover:text-forest bg-sage-wash/60 border border-sage/30 transition-colors"
            >
              UI System
            </Link>
            
            <button
              type="button"
              className="px-3.5 py-2 text-sm font-medium text-charcoal hover:text-forest transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              onClick={() => alert('Authentication will be implemented in Module 2.')}
            >
              Login
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-ivory hover:bg-forest-light shadow-warm-sm active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              onClick={() => alert('Registration will be implemented in Module 2.')}
            >
              <Heart className="w-4 h-4 text-orange-muted" />
              Register
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-charcoal hover:bg-ivory-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-grey-light bg-ivory px-4 pt-3 pb-6 space-y-4 shadow-warm animate-in fade-in duration-150">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={closeMobile}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-sage-wash text-forest font-semibold'
                      : 'text-charcoal-muted hover:bg-ivory-warm hover:text-forest'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
            <NavLink
              to="/design-system"
              onClick={closeMobile}
              className="block px-3 py-2.5 rounded-lg text-sm text-forest font-medium bg-forest-subtle/70"
            >
              🎨 Component Showcase (Dev)
            </NavLink>
          </div>

          <div className="pt-4 border-t border-grey-light space-y-2">
            <button
              type="button"
              className="w-full py-2.5 text-center text-sm font-medium text-charcoal rounded-lg border border-grey-light bg-white hover:bg-ivory-warm transition-colors"
              onClick={() => {
                closeMobile();
                alert('Authentication will be implemented in Module 2.');
              }}
            >
              Login
            </button>
            <button
              type="button"
              className="w-full py-2.5 text-center text-sm font-medium rounded-lg bg-forest text-ivory hover:bg-forest-light shadow-warm-sm transition-colors"
              onClick={() => {
                closeMobile();
                alert('Registration will be implemented in Module 2.');
              }}
            >
              Register
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center text-xs text-charcoal-muted gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Academic Simulation Platform</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
