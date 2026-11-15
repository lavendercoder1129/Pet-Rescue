const variantMap = {
  default: 'bg-white border-grey-light hover:border-sage/50',
  ivory: 'bg-ivory-warm/60 border-grey-light hover:border-sage/40',
  forest: 'bg-forest text-ivory border-forest-light',
  subtle: 'bg-forest-subtle/50 border-forest/20',
};

const paddingMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const BaseCard = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = true,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={`rounded-2xl border transition-all duration-200 ${variantMap[variant] || variantMap.default} ${paddingMap[padding] || paddingMap.md} ${
        hover ? 'shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5' : 'shadow-warm-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default BaseCard;
