import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputGroup = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative flex items-center w-full", className)} {...props}>
        {children}
      </div>
    );
  }
);
InputGroup.displayName = "InputGroup";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, disabled, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full rounded-lg bg-[#3A3A3A] px-4 py-2.5 text-text-primary placeholder:text-text-muted",
              "border border-transparent outline-none",
              "focus:ring-2 focus:ring-brand-orange",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-status-error focus:ring-status-error", 
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn("text-xs", error ? "text-status-error" : "text-text-muted")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
