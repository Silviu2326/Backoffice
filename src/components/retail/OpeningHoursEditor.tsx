import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Copy } from 'lucide-react';

export type DaySchedule = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map((day) => ({
  day,
  isOpen: true,
  openTime: '09:00',
  closeTime: '18:00',
}));

interface OpeningHoursEditorProps {
  value?: DaySchedule[];
  onChange?: (schedule: DaySchedule[]) => void;
}

export const OpeningHoursEditor = ({ value, onChange }: OpeningHoursEditorProps) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(value || DEFAULT_SCHEDULE);

  useEffect(() => {
    if (value) {
      setSchedule(value);
    }
  }, [value]);

  const handleScheduleChange = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    if (onChange) {
      onChange(newSchedule);
    }
  };

  const updateDay = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    handleScheduleChange(newSchedule);
  };

  const applyToWeekdays = () => {
    const monday = schedule[0];
    const newSchedule = schedule.map((day, index) => {
      // Lunes (0) is the source. Apply to Martes (1) through Viernes (4)
      if (index >= 1 && index <= 4) {
        return {
          ...day,
          isOpen: monday.isOpen,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
        };
      }
      return day;
    });
    handleScheduleChange(newSchedule);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Horario de Apertura</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={applyToWeekdays}
          leftIcon={<Copy className="w-4 h-4" />}
          title="Copiar horario del lunes al resto de días laborables"
        >
          Aplicar a días laborables
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((day, index) => (
          <div 
            key={day.day} 
            className="flex items-center gap-4 p-3 rounded-lg bg-[#333333] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="w-40 flex items-center gap-3">
              <input
                type="checkbox"
                checked={day.isOpen}
                onChange={(e) => updateDay(index, 'isOpen', e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-[#2C2C2C] text-[#F76934] focus:ring-[#F76934] focus:ring-offset-0 cursor-pointer accent-[#F76934]"
              />
              <span className={`font-medium ${day.isOpen ? 'text-white' : 'text-gray-500'}`}>
                {day.day}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-4">
              {day.isOpen ? (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Desde</span>
                    <Input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => updateDay(index, 'openTime', e.target.value)}
                      className="w-32 !py-1.5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Hasta</span>
                    <Input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => updateDay(index, 'closeTime', e.target.value)}
                      className="w-32 !py-1.5"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-gray-500 italic px-4 py-2">Cerrado</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
