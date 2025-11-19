import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const variantStyles = {
  success: 'bg-white border-l-4 border-l-emerald-500',
  error: 'bg-white border-l-4 border-l-red-500',
  info: 'bg-white border-l-4 border-l-blue-500',
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

const progressColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export function Toast({
  id,
  title,
  description,
  variant,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[variant];

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    // Start progress bar animation
    const progressTimer = setTimeout(() => {
      setProgress(0);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(progressTimer);
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for animation to finish before calling onDismiss
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'group relative pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-md border border-gray-100 shadow-lg transition-all duration-300 ease-in-out bg-white',
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        variantStyles[variant]
      )}
      role="alert"
    >
      <div className="flex w-full p-4">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColors[variant])} />
        </div>
        <div className="ml-3 flex-1">
          {title && <p className="text-sm font-medium text-gray-900">{title}</p>}
          {description && (
            <p className={cn('text-sm text-gray-500', title && 'mt-1')}>
              {description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0 self-start">
          <button
            type="button"
            className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleDismiss}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100">
        <div
          className={cn('h-full transition-all ease-linear', progressColors[variant])}
          style={{
            width: `${progress}%`,
            transitionDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
}
