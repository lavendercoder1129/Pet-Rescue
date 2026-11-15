import { CheckCircle2, Clock, AlertTriangle, XCircle, Info } from 'lucide-react';

const statusConfigs = {
  active: {
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  pending: {
    style: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  verified: {
    style: 'bg-sage-wash text-forest border-sage/50',
    icon: CheckCircle2,
  },
  review: {
    style: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Info,
  },
  closed: {
    style: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: XCircle,
  },
  alert: {
    style: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: AlertTriangle,
  },
};

export const StatusBadge = ({
  status = 'active',
  label,
  showIcon = true,
  className = '',
}) => {
  const normalized = status.toLowerCase();
  const config = statusConfigs[normalized] || statusConfigs.active;
  const IconComponent = config.icon;

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style} ${className}`}
    >
      {showIcon && IconComponent && <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
