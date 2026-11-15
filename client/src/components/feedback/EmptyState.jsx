import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active items to display right now.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-grey-light bg-white/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-sage-wash/80 flex items-center justify-center text-forest shadow-warm-sm">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h2 className="font-serif text-xl font-bold text-forest">{title}</h2>
        <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
