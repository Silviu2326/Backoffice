
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card'; // Assuming Card component exists in src/components/ui

interface KPIWidgetProps {
  title: string;
  value: string | number;
  trend?: number; // percentage
  trendLabel?: string;
  icon: LucideIcon;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({ title, value, trend, trendLabel, icon: Icon }) => {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const trendColorClass = trend !== undefined
    ? (isPositiveTrend ? 'text-status-success' : 'text-status-error')
    : '';

  return (
    <Card className="p-5 flex flex-col justify-between bg-[#2C2C2C] border border-white/5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold text-white mt-2 font-display">{value}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="p-3 rounded-xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20"> 
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-bold ${trendColorClass}`}>
            {isPositiveTrend ? '+' : ''}{trend}%
          </span>
          {trendLabel && <span className="ml-2 text-text-muted">{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
};

export default KPIWidget;
