import { Info } from 'lucide-react';

const schemeMap = {
  sage: {
    bg: 'bg-sage-wash/70',
    border: 'border-sage/40',
    iconBg: 'bg-sage text-forest',
    title: 'text-forest',
  },
  forest: {
    bg: 'bg-forest-subtle/80',
    border: 'border-forest/20',
    iconBg: 'bg-forest text-ivory',
    title: 'text-forest',
  },
  orange: {
    bg: 'bg-orange-subtle',
    border: 'border-orange-muted/30',
    iconBg: 'bg-orange-muted text-white',
    title: 'text-orange-hover',
  },
  neutral: {
    bg: 'bg-white',
    border: 'border-grey-light',
    iconBg: 'bg-ivory-warm text-charcoal',
    title: 'text-charcoal',
  },
};

export const InfoCard = ({
  title,
  description,
  icon: Icon = Info,
  scheme = 'neutral',
  action,
  className = '',
}) => {
  const current = schemeMap[scheme] || schemeMap.neutral;

  return (
    <div
      className={`rounded-2xl border p-6 shadow-warm-sm transition-all duration-200 ${current.bg} ${current.border} ${className}`}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${current.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="space-y-1.5 flex-1">
          {title && (
            <h2 className={`font-serif text-lg font-bold ${current.title}`}>
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
              {description}
            </p>
          )}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
