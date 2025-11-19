import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        brand:
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
        danger:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <svg
          className={cn(
            "-ml-0.5 mr-1.5 h-2 w-2",
            variant === "default" && "text-gray-400",
            variant === "brand" && "text-orange-400",
            variant === "success" && "text-green-400",
            variant === "warning" && "text-yellow-400",
            variant === "danger" && "text-red-400"
          )}
          fill="currentColor"
          viewBox="0 0 8 8"
        >
          <circle cx={4} cy={4} r={3} />
        </svg>
      )}
      {props.children}
    </div>
  );
}

export { Badge, badgeVariants };
