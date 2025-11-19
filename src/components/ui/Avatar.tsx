import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline';
}

const AVATAR_COLORS = [
  'bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-green-600', 
  'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600', 
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-purple-600', 
  'bg-fuchsia-600', 'bg-pink-600', 'bg-rose-600'
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', status, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-14 w-14 text-lg',
      '2xl': 'h-16 w-16 text-xl',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5 border-[1.5px]',
      sm: 'h-2 w-2 border-2',
      md: 'h-2.5 w-2.5 border-2',
      lg: 'h-3 w-3 border-2',
      xl: 'h-3.5 w-3.5 border-[3px]',
      '2xl': 'h-4 w-4 border-[3px]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-block shrink-0', 
          sizes[size], 
          className
        )}
        {...props}
      >
        <div className={cn(
          "h-full w-full rounded-full overflow-hidden flex items-center justify-center transition-colors",
          !src || hasError ? getAvatarColor(fallback) : "bg-brand-surface"
        )}>
          {src && !hasError ? (
            <img
              src={src}
              alt={alt || fallback}
              className="h-full w-full object-cover"
              onError={() => setHasError(true)}
            />
          ) : (
            <span className="font-bold text-white font-body tracking-wider select-none">
              {fallback.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full ring-brand-dark",
              statusSizes[size],
              status === 'online' ? 'bg-status-success' : 'bg-text-secondary'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
