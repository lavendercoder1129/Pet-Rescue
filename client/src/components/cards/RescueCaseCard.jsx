import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Eye } from 'lucide-react';
import UrgencyBadge from '../feedback/UrgencyBadge';
import ProgressBar from '../feedback/ProgressBar';
import PrimaryButton from '../common/PrimaryButton';
import OutlineButton from '../common/OutlineButton';

export const RescueCaseCard = ({
  id,
  image,
  fallbackImage,
  title,
  animalType = 'Dog',
  location,
  injuryDescription,
  urgency = 'urgent',
  currentAmount = 0,
  targetAmount = 1000,
  donorCount = 0,
  onDonate,
  onViewCase,
  caseUrl,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState(image);
  const percentage = Math.round((currentAmount / (targetAmount || 1)) * 100);
  const detailUrl = caseUrl || (id ? `/cases/${id}` : '/cases');

  const handleImageError = () => {
    if (fallbackImage && imgSrc !== fallbackImage) {
      setImgSrc(fallbackImage);
    }
  };

  return (
    <article
      className={`group rounded-2xl bg-white border border-grey-light overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col h-full ${className}`}
    >
      {/* Visual Image container with Urgency Overlay */}
      <div className="relative aspect-[16/10] bg-ivory-warm overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`Injured ${animalType} - ${title}`}
            onError={handleImageError}
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

          <Link to={detailUrl} className="block group-hover:text-forest-light transition-colors">
            <h3 className="font-serif text-xl font-bold text-forest leading-snug">
              {title}
            </h3>
          </Link>

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

          <div className="text-xs text-charcoal-muted">
            {donorCount} simulated supporters
          </div>

          {/* Action buttons: View Case & Support This Rescue */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {onViewCase ? (
              <OutlineButton
                size="sm"
                icon={Eye}
                onClick={onViewCase}
                className="w-full text-xs"
              >
                View Case
              </OutlineButton>
            ) : (
              <Link to={detailUrl} className="w-full">
                <OutlineButton
                  size="sm"
                  icon={Eye}
                  className="w-full text-xs"
                >
                  View Case
                </OutlineButton>
              </Link>
            )}

            <PrimaryButton
              size="sm"
              icon={Heart}
              onClick={onDonate}
              className="w-full text-xs bg-orange-muted hover:bg-orange-hover text-white shadow-none"
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
