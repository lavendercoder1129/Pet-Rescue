const urgencyStyles = {
  critical: 'bg-rose-50 text-rose-800 border-rose-200/80',
  urgent: 'bg-orange-subtle text-orange-muted border-orange-muted/40',
  normal: 'bg-sage-wash text-forest border-sage/40',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const dotColors = {
  critical: 'bg-rose-500 animate-pulse',
  urgent: 'bg-orange-muted',
  normal: 'bg-sage-dark',
  resolved: 'bg-emerald-600',
};

export const UrgencyBadge = ({
  level = 'normal',
  className = '',
  showDot = true,
}) => {
  const normalized = level.toLowerCase();
  const currentStyle = urgencyStyles[normalized] || urgencyStyles.normal;
  const currentDot = dotColors[normalized] || dotColors.normal;

  const labelMap = {
    critical: 'Critical Emergency',
    urgent: 'Urgent Care',
    normal: 'Normal Priority',
    resolved: 'Case Resolved',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${currentStyle} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />}
      {labelMap[normalized] || level}
    </span>
  );
};

export default UrgencyBadge;
