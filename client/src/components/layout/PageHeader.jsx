export const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  badge,
  actions,
  align = 'left',
  className = '',
}) => {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  return (
    <header className={`space-y-4 max-w-4xl ${alignClasses[align] || alignClasses.left} ${className}`}>
      {(eyebrow || badge) && (
        <div className={`flex flex-wrap items-center gap-2.5 ${align === 'center' ? 'justify-center' : ''}`}>
          {badge && <div>{badge}</div>}
          {eyebrow && (
            <span className="text-xs font-semibold tracking-widest text-orange-muted uppercase font-sans">
              {eyebrow}
            </span>
          )}
        </div>
      )}

      {title && (
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest tracking-tight leading-[1.2]">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed font-sans max-w-2xl">
          {subtitle}
        </p>
      )}

      {actions && (
        <div className={`pt-2 flex flex-wrap items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
