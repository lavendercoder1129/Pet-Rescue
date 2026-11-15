import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import FormLabel from './FormLabel';

export const FormSelect = forwardRef(({
  id,
  name,
  label,
  options = [],
  value,
  defaultValue,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  optional = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  selectClassName = '',
  children,
  ...props
}, ref) => {
  const selectId = id || name;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {label && (
        <FormLabel htmlFor={selectId} required={required} optional={optional}>
          {label}
        </FormLabel>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`w-full appearance-none rounded-xl bg-white text-charcoal text-sm transition-all duration-150 ease-out border disabled:bg-ivory-warm disabled:cursor-not-allowed pl-4 pr-10 py-2.5 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
              : 'border-grey-light hover:border-sage focus:border-forest focus:ring-2 focus:ring-forest/15'
          } focus:outline-none ${selectClassName}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-charcoal-muted">
              {placeholder}
            </option>
          )}

          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-rose-700 font-medium pt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="text-xs text-charcoal-muted pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
