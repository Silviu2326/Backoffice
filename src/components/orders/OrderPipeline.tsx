import { Check, X } from 'lucide-react';
import { OrderStatus } from '../../types/core';
import { cn } from '../../utils/cn';

interface OrderPipelineProps {
  status: OrderStatus;
}

// Mapping for display labels and grouping slightly different backend statuses to visual steps
const STEPS = [
  { 
    label: 'Recibido', 
    validStatuses: [OrderStatus.PENDING_PAYMENT] 
  },
  { 
    label: 'Pagado', 
    validStatuses: [OrderStatus.PAID] 
  },
  { 
    label: 'Preparación', 
    validStatuses: [OrderStatus.PREPARING, OrderStatus.READY_TO_SHIP] 
  },
  { 
    label: 'Enviado', 
    validStatuses: [OrderStatus.SHIPPED] 
  },
  { 
    label: 'Entregado', 
    validStatuses: [OrderStatus.DELIVERED] 
  },
];

export function OrderPipeline({ status }: OrderPipelineProps) {
  // Determine the index of the current step based on the status
  const getCurrentStepIndex = () => {
    // Handle edge cases
    if (status === OrderStatus.RETURNED || status === OrderStatus.CANCELLED) {
      return -1; // Special handling could be added
    }

    // Find which step contains the current status
    const index = STEPS.findIndex(step => step.validStatuses.includes(status));
    
    if (index !== -1) return index;

    // Fallback if status is something weird or strictly between steps? 
    // Logic: if we passed a step in the flow.
    // But simply, let's treat the defined STEPS as the visualization anchor.
    
    // If status is 'READY_TO_SHIP', it maps to 'Preparación' (index 2).
    return 0; // Default to start if unknown
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = status === OrderStatus.CANCELLED;

  if (isCancelled) {
     return (
        <div className="w-full p-4 bg-brand-surface/50 rounded-lg border border-status-error/30 flex items-center justify-center text-status-error gap-2">
             <X size={20} />
             <span className="font-medium">Pedido Cancelado</span>
        </div>
     )
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between w-full">
        
        {/* Connecting Lines Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-brand-surface rounded-full -z-10" />

        {/* Active Line Progress */}
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-orange rounded-full -z-10 transition-all duration-500 ease-out"
            style={{ 
                width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` 
            }} 
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div key={step.label} className="flex flex-col items-center group relative">
              
              {/* Node Circle */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-brand-dark",
                  isCompleted && "bg-brand-orange border-brand-orange text-white",
                  isCurrent && "border-brand-orange text-brand-orange shadow-[0_0_15px_rgba(247,105,52,0.5)] animate-pulse",
                  isFuture && "border-gray-600 text-gray-600 bg-brand-surface"
                )}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isCurrent ? "bg-brand-orange" : "bg-gray-600"
                  )} />
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                isCompleted && "text-text-primary",
                isCurrent && "text-brand-orange font-bold",
                isFuture && "text-text-muted"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}