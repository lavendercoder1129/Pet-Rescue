import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const OutlineButton = ({
  children,
  className = '',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  variant = 'default',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const variantMap = {
    default: 'border-grey-light text-charcoal hover:border-forest/40 hover:bg-white',
    forest: 'border-forest/40 text-forest hover:bg-forest-subtle hover:border-forest',
    orange: 'border-orange-muted/40 text-orange-muted hover:bg-orange-subtle hover:border-orange-muted',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg bg-transparent border transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${variantMap[variant] || variantMap.default} ${sizeMap[size] || sizeMap.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-charcoal-muted" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 ml-2" />}
        </>
      )}
    </button>
  );
};

export default OutlineButton;
