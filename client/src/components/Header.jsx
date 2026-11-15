import { Link, NavLink } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Github } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-ivory-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-ivory shadow-sm group-hover:bg-forest-light transition-colors">
              <HeartHandshake className="w-6 h-6 text-sage-light" />
            </div>
            <div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-forest block leading-none">
                Pet Rescue
              </span>
              <span className="text-[11px] font-sans text-charcoal-muted uppercase tracking-widest block mt-0.5 font-medium">
                Emergency Stray Care
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'text-forest font-semibold'
                  : 'text-charcoal-muted hover:text-forest transition-colors'
              }
            >
              Overview
            </NavLink>
            <a
              href="#roadmap"
              className="text-charcoal-muted hover:text-forest transition-colors"
            >
              Project Roadmap
            </a>
            <a
              href="#architecture"
              className="text-charcoal-muted hover:text-forest transition-colors"
            >
              Architecture
            </a>
          </nav>

          {/* Actions / Meta badge */}
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage-wash text-forest border border-sage/40">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              Module 0 Active
            </span>
            <a
              href="https://github.com/lavendercoder1129/Pet-Rescue.git"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-charcoal-muted hover:text-forest transition-colors rounded-lg hover:bg-ivory-warm"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
