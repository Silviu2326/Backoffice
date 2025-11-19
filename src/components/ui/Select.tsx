import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled,
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "relative w-full flex items-center justify-between rounded-lg bg-[#3A3A3A] px-4 py-2.5 text-left text-sm text-text-primary",
            "border border-transparent outline-none",
            "focus:ring-2 focus:ring-brand-orange",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            isOpen && "ring-2 ring-brand-orange",
            error && "border-status-error focus:ring-status-error ring-status-error",
            !selectedOption && "text-text-muted"
          )}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-text-muted transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-[#2C2C2C] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-white/5">
            {options.length === 0 ? (
              <div className="relative cursor-default select-none py-2 px-4 text-text-muted">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative cursor-pointer select-none py-2 pl-10 pr-4 text-text-primary transition-colors duration-150",
                    "hover:bg-white/5",
                    option.value === value && "bg-white/5 text-brand-orange"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span
                    className={cn(
                      "block truncate",
                      option.value === value ? "font-medium" : "font-normal"
                    )}
                  >
                    {option.label}
                  </span>
                  {option.value === value && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-orange">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-status-error">
          {error}
        </p>
      )}
    </div>
  );
};
