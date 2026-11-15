const colorMap = {
  forest: 'bg-forest-subtle text-forest',
  sage: 'bg-sage-wash text-sage-dark',
  orange: 'bg-orange-subtle text-orange-muted',
  charcoal: 'bg-ivory-warm text-charcoal',
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'forest',
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl bg-white border border-grey-light p-6 shadow-warm hover:shadow-warm-lg transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-muted font-sans">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[colorScheme] || colorMap.forest}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="font-serif text-3xl font-bold text-forest tracking-tight">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center justify-between text-xs text-charcoal-muted">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span className={`font-medium ${trend.positive ? 'text-emerald-700' : 'text-rose-700'}`}>
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
