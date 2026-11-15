import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'w-8 h-8 p-1.5',
  md: 'w-10 h-10 p-2',
  lg: 'w-12 h-12 p-2.5',
};

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const IconButton = ({
  icon: Icon,
  className = '',
  size = 'md',
  variant = 'default',
  isLoading = false,
  disabled = false,
  'aria-label': ariaLabel,
  title,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const variantMap = {
    default: 'text-charcoal-muted hover:text-forest hover:bg-ivory-warm border border-transparent',
    outline: 'text-charcoal border border-grey-light hover:border-forest/40 hover:bg-white',
    filled: 'bg-forest text-ivory hover:bg-forest-light shadow-warm-sm',
    accent: 'bg-orange-muted text-white hover:bg-orange-hover shadow-warm-sm',
    ghost: 'text-charcoal hover:bg-forest-subtle hover:text-forest',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel || title}
      title={title || ariaLabel}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${variantMap[variant] || variantMap.default} ${sizeMap[size] || sizeMap.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizeMap[size] || iconSizeMap.md} animate-spin`} />
      ) : (
        Icon && <Icon className={iconSizeMap[size] || iconSizeMap.md} />
      )}
    </button>
  );
};

export default IconButton;
