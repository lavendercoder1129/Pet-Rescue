import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable Breadcrumbs navigation component
 * @param {Array<{ label: string, path?: string }>} items
 */
export const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-charcoal-muted mb-6 overflow-x-auto whitespace-nowrap py-1">
      <Link
        to="/"
        className="flex items-center hover:text-forest transition-colors gap-1 text-charcoal-soft"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-grey-dark flex-shrink-0" />
            {isLast || !item.path ? (
              <span className="text-forest font-semibold truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-forest transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
