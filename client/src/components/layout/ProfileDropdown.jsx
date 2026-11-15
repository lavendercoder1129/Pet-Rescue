import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Heart,
  Award,
  Receipt,
  FileCheck,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  if (!user) return null;

  const dashboardPath = `/${user.role}/dashboard`;

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return { label: 'Administrator', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'rescuer':
        return {
          label: user.rescuerVerificationStatus === 'approved' ? 'Verified Rescuer' : 'Rescuer (Pending)',
          bg: user.rescuerVerificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200',
        };
      default:
        return { label: 'Donor Partner', bg: 'bg-forest/10 text-forest border-forest/20' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-ivory-warm border border-grey-light hover:border-forest/40 focus:outline-none focus:ring-2 focus:ring-forest/30 transition-all text-left group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-7 h-7 rounded-lg bg-forest text-ivory flex items-center justify-center font-serif font-bold text-xs shadow-warm-xs group-hover:bg-forest-light transition-colors">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-charcoal block leading-none truncate max-w-[100px]">
            {user.name?.split(' ')[0]}
          </span>
          <span className="text-[10px] text-charcoal-muted uppercase font-medium tracking-wider block mt-0.5">
            {user.role}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-charcoal-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-forest' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-grey-light shadow-warm-lg z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User Header Details */}
          <div className="px-4 py-3 border-b border-grey-light/70 bg-sage-wash/30">
            <div className="text-xs font-bold text-charcoal truncate">{user.name}</div>
            <div className="text-[11px] font-mono text-charcoal-muted truncate">{user.email}</div>
            <div className="mt-2">
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Role-Specific Quick Navigation Links */}
          <div className="py-1">
            <Link
              to={dashboardPath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-forest" />
              <span>{user.role === 'admin' ? 'Admin Control Center' : `${user.role === 'rescuer' ? 'Rescuer' : 'Donor'} Dashboard`}</span>
            </Link>

            {user.role === 'donor' && (
              <>
                <Link
                  to="/donor/donations"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Receipt className="w-4 h-4 text-forest" />
                  <span>Donation History & Receipts</span>
                </Link>
                <Link
                  to="/donor/achievements"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Award className="w-4 h-4 text-orange-muted" />
                  <span>My Achievement Badges</span>
                </Link>
              </>
            )}

            {user.role === 'rescuer' && (
              <>
                <Link
                  to="/rescuer/cases"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>My Submitted Cases</span>
                </Link>
                <Link
                  to="/rescuer/updates"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-forest" />
                  <span>Rescue Updates Journal</span>
                </Link>
                <Link
                  to="/rescuer/expenses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Receipt className="w-4 h-4 text-amber-700" />
                  <span>Treatment Expense Proofs</span>
                </Link>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <Link
                  to="/admin/cases"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Shield className="w-4 h-4 text-rose-700" />
                  <span>Verify Cases & Triage</span>
                </Link>
                <Link
                  to="/admin/funds"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Receipt className="w-4 h-4 text-forest" />
                  <span>Fund Allocations</span>
                </Link>
                <Link
                  to="/admin/achievements"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-sage-wash hover:text-forest transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Badge Definitions</span>
                </Link>
              </>
            )}
          </div>

          {/* Sign Out Action */}
          <div className="pt-1 mt-1 border-t border-grey-light/70">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
