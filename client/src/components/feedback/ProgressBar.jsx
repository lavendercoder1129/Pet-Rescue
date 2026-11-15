export const ProgressBar = ({
  value = 0,
  max = 100,
  showLabels = false,
  label,
  valueText,
  variant = 'forest',
  size = 'md',
  className = '',
}) => {
  const safeMax = max <= 0 ? 100 : max;
  const percentage = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)));

  const variantMap = {
    forest: 'bg-forest',
    orange: 'bg-orange-muted',
    sage: 'bg-sage-dark',
    emerald: 'bg-emerald-600',
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-charcoal-muted font-medium">
          <span>{label || 'Funded'}</span>
          <span>{valueText || `${percentage}%`}</span>
        </div>
      )}
      <div
        className={`w-full bg-grey-light/80 rounded-full overflow-hidden ${sizeMap[size] || sizeMap.md}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantMap[variant] || variantMap.forest}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
