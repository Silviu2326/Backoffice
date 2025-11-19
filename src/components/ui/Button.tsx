import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-gradient-to-r from-[#F76934] to-[#FF8C42] text-white shadow-[0_4px_14px_0_rgba(247,105,52,0.3)] hover:shadow-[0_6px_20px_rgba(247,105,52,0.4)] border-none',
      secondary: 'bg-[#2C2C2C] text-white hover:bg-[#353535] border-none',
      outline: 'bg-transparent border border-[#3A3A3A] text-gray-400 hover:text-white hover:border-gray-500',
      ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-none',
      danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-10 w-10 p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-body font-bold rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F76934]/50 focus:ring-offset-2 focus:ring-offset-[#1A1A1A]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          </div>
        )}
        
        <span className={cn("flex items-center justify-center gap-2", isLoading ? "opacity-0" : "opacity-100")}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
