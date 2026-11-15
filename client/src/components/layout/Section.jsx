export const Section = ({
  children,
  className = '',
  id,
  variant = 'default',
  spacing = 'default',
  as: Component = 'section',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-transparent text-charcoal',
    ivory: 'bg-ivory text-charcoal',
    warm: 'bg-ivory-warm/70 text-charcoal border-y border-grey-light',
    white: 'bg-white text-charcoal shadow-warm-sm',
    forest: 'bg-forest text-ivory',
  };

  const spacingClasses = {
    none: 'py-0',
    sm: 'py-8 sm:py-12',
    default: 'py-14 sm:py-20',
    lg: 'py-20 sm:py-28',
  };

  return (
    <Component
      id={id}
      className={`${variantClasses[variant] || variantClasses.default} ${spacingClasses[spacing] || spacingClasses.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Section;
