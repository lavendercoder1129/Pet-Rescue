import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Menu,
  X,
  ShieldCheck,
  Heart,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Container from './Container';
import NotificationDropdown from '../feedback/NotificationDropdown';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Emergency Cases', path: '/cases' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Transparency', path: '/transparency' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Announcements', path: '/announcements' },
  ];

  const closeMobile = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobile();
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

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
              title="Design System Showcase"
            >
              UI System
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* In-app Notification Bell */}
                <NotificationDropdown />

                {/* User badge with role */}
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ivory-warm border border-grey-light hover:border-forest/40 transition-colors"
                  title="Open Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-forest text-ivory flex items-center justify-center text-[11px] font-serif font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-charcoal block leading-none">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-forest font-medium uppercase tracking-wider block mt-0.5">
                      {user?.role}
                    </span>
                  </div>
                  <LayoutDashboard className="w-3.5 h-3.5 text-sage-dark ml-1" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-charcoal-muted hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-charcoal hover:text-forest transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-ivory hover:bg-forest-light shadow-warm-sm active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <Heart className="w-4 h-4 text-orange-muted" />
                  Register
                </Link>
              </div>
            )}
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
          {isAuthenticated && (
            <div className="p-3 rounded-xl bg-ivory-warm border border-grey-light flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest text-ivory flex items-center justify-center font-serif font-bold text-xs">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal">{user?.name}</div>
                  <div className="text-[10px] uppercase font-semibold text-forest">
                    {user?.role} Account
                  </div>
                </div>
              </div>
              <Link
                to={getDashboardPath()}
                onClick={closeMobile}
                className="text-xs font-semibold text-forest bg-sage-wash px-2.5 py-1 rounded-md"
              >
                Dashboard
              </Link>
            </div>
          )}

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
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 text-center text-sm font-medium text-rose-700 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out ({user?.name?.split(' ')[0]})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="block w-full py-2.5 text-center text-sm font-medium text-charcoal rounded-lg border border-grey-light bg-white hover:bg-ivory-warm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="block w-full py-2.5 text-center text-sm font-medium rounded-lg bg-forest text-ivory hover:bg-forest-light shadow-warm-sm transition-colors text-center"
                >
                  Register
                </Link>
              </>
            )}
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
