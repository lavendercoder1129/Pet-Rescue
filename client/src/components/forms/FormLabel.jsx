export const FormLabel = ({
  children,
  htmlFor,
  required = false,
  optional = false,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-semibold uppercase tracking-wider text-charcoal font-sans mb-1.5 ${className}`}
    >
      <span>{children}</span>
      {required && <span className="text-rose-600 ml-1" title="Required field">*</span>}
      {optional && <span className="text-charcoal-muted normal-case font-normal ml-1.5">(Optional)</span>}
    </label>
  );
};

export default FormLabel;
