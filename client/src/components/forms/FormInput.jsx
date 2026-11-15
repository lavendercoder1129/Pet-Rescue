import { forwardRef } from 'react';
import FormLabel from './FormLabel';

export const FormInput = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  optional = false,
  disabled = false,
  icon: Icon,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {label && (
        <FormLabel htmlFor={inputId} required={required} optional={optional}>
          {label}
        </FormLabel>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full rounded-xl bg-white text-charcoal text-sm transition-all duration-150 ease-out border placeholder:text-charcoal-muted/60 disabled:bg-ivory-warm disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 py-2.5 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
              : 'border-grey-light hover:border-sage focus:border-forest focus:ring-2 focus:ring-forest/15'
          } focus:outline-none ${inputClassName}`}
          {...props}
        />
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-rose-700 font-medium pt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-charcoal-muted pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
