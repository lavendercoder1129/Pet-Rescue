import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Loading rescue updates...',
  subtext = 'Connecting to verified data sources',
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-grey-light bg-white/70 p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-warm-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-forest-subtle flex items-center justify-center text-forest">
        <Loader2 className="w-6 h-6 animate-spin text-forest" />
      </div>
      <div className="space-y-1">
        <div className="font-serif text-lg font-bold text-forest">{message}</div>
        {subtext && <p className="text-xs text-charcoal-muted">{subtext}</p>}
      </div>
    </div>
  );
};

export default LoadingState;
