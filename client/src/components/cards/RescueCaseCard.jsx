import { MapPin, Heart } from 'lucide-react';
import UrgencyBadge from '../feedback/UrgencyBadge';
import ProgressBar from '../feedback/ProgressBar';
import PrimaryButton from '../common/PrimaryButton';

export const RescueCaseCard = ({
  image,
  title,
  animalType = 'Dog',
  location,
  injuryDescription,
  urgency = 'urgent',
  currentAmount = 0,
  targetAmount = 1000,
  donorCount = 0,
  onDonate,
  className = '',
}) => {
  const percentage = Math.round((currentAmount / (targetAmount || 1)) * 100);

  return (
    <article
      className={`group rounded-2xl bg-white border border-grey-light overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col h-full ${className}`}
    >
      {/* Visual Image container with Urgency Overlay */}
      <div className="relative aspect-[16/10] bg-ivory-warm overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`Injured ${animalType} - ${title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-forest-subtle/50 text-forest">
            <span className="font-serif text-lg font-medium opacity-60">
              {animalType} Rescue Photo
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <UrgencyBadge level={urgency} />
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-charcoal shadow-warm-sm">
          {animalType}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
              <MapPin className="w-3.5 h-3.5 text-sage-dark flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}

          <h3 className="font-serif text-xl font-bold text-forest leading-snug group-hover:text-forest-light transition-colors">
            {title}
          </h3>

          <p className="text-sm text-charcoal-muted line-clamp-2 leading-relaxed">
            {injuryDescription}
          </p>
        </div>

        {/* Financial Progress & Funding Bar */}
        <div className="pt-2 space-y-3 border-t border-grey-light/60">
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="font-serif text-lg font-bold text-forest">
                ₹{currentAmount.toLocaleString()}
              </span>
              <span className="text-charcoal-muted ml-1">raised of ₹{targetAmount.toLocaleString()}</span>
            </div>
            <span className="font-semibold text-forest">{percentage}%</span>
          </div>

          <ProgressBar
            value={currentAmount}
            max={targetAmount}
            variant={percentage >= 100 ? 'emerald' : 'forest'}
            size="sm"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-charcoal-muted">
              {donorCount} simulated supporters
            </span>

            <PrimaryButton
              size="sm"
              icon={Heart}
              onClick={onDonate}
              className="bg-orange-muted hover:bg-orange-hover text-white shadow-none"
            >
              Support Case
            </PrimaryButton>
          </div>
        </div>
      </div>
    </article>
  );
};

export default RescueCaseCard;
