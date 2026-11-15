export const Container = ({
  children,
  className = '',
  size = 'default',
  as: Component = 'div',
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1400px]',
    narrow: 'max-w-3xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
