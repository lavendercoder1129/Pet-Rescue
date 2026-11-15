import { NavLink } from 'react-router-dom';

/**
 * Reusable Dashboard Sidebar for role-specific portals (Donor, Rescuer, Admin)
 * @param {Array<{ label: string, path: string, icon: LucideIcon, badge?: string | number, color?: string }>} links
 * @param {string} title
 * @param {string} subtitle
 */
export const DashboardSidebar = ({ links = [], title = 'Portal', subtitle = 'Management' }) => {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-grey-light shadow-warm-xs p-4 sticky top-24">
        <div className="px-3 py-2 border-b border-grey-light/70 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-forest block">
            {title}
          </span>
          <span className="text-xs text-charcoal-muted">
            {subtitle}
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest text-ivory font-semibold shadow-warm-xs'
                      : 'text-charcoal-soft hover:bg-sage-wash hover:text-forest'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      {Icon && (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-sage-light' : 'text-charcoal-muted group-hover:text-forest'
                          }`}
                        />
                      )}
                      <span>{link.label}</span>
                    </div>

                    {link.badge !== undefined && link.badge !== null && link.badge !== 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-ivory/20 text-white'
                            : link.badgeColor || 'bg-sage-wash text-forest'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
