import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Copy, Plus, Trash2 } from 'lucide-react';

export type TimePeriod = {
  openTime: string;
  closeTime: string;
};

export type DaySchedule = {
  day: string;
  isOpen: boolean;
  periods: TimePeriod[];
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
  periods: [{ openTime: '09:00', closeTime: '18:00' }],
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

  const updateDay = (index: number, updates: Partial<DaySchedule>) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], ...updates };
    handleScheduleChange(newSchedule);
  };

  const updatePeriod = (dayIndex: number, periodIndex: number, field: keyof TimePeriod, value: string) => {
    const newSchedule = [...schedule];
    const newPeriods = [...newSchedule[dayIndex].periods];
    newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], periods: newPeriods };
    handleScheduleChange(newSchedule);
  };

  const addPeriod = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].periods.push({ openTime: '17:00', closeTime: '20:00' });
    handleScheduleChange(newSchedule);
  };

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].periods.splice(periodIndex, 1);
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
          periods: monday.periods.map(p => ({ ...p })),
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
          Aplicar Lunes a días laborales
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((day, index) => (
          <div
            key={day.day}
            className="flex items-start gap-4 p-3 rounded-lg bg-[#333333] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="w-40 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                checked={day.isOpen}
                onChange={(e) => updateDay(index, { isOpen: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-[#2C2C2C] text-[#F76934] focus:ring-[#F76934] focus:ring-offset-0 cursor-pointer accent-[#F76934]"
              />
              <span className={`font-medium ${day.isOpen ? 'text-white' : 'text-gray-500'}`}>
                {day.day}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              {day.isOpen ? (
                <>
                  {day.periods.map((period, pIndex) => (
                    <div key={pIndex} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 uppercase tracking-wider w-12">Desde</span>
                        <Input
                          type="time"
                          value={period.openTime}
                          onChange={(e) => updatePeriod(index, pIndex, 'openTime', e.target.value)}
                          className="w-32 !py-1.5"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 uppercase tracking-wider w-12">Hasta</span>
                        <Input
                          type="time"
                          value={period.closeTime}
                          onChange={(e) => updatePeriod(index, pIndex, 'closeTime', e.target.value)}
                          className="w-32 !py-1.5"
                        />
                      </div>
                      <button
                        onClick={() => removePeriod(index, pIndex)}
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-white/5 transition-colors"
                        title="Eliminar franja"
                        disabled={day.periods.length === 1}
                      >
                        <Trash2 className={`w-4 h-4 ${day.periods.length === 1 ? 'opacity-30' : ''}`} />
                      </button>
                    </div>
                  ))}

                  <div className="pt-1">
                    <Button
                      variant="ghost"
                      onClick={() => addPeriod(index)}
                      className="text-xs text-brand-orange hover:bg-brand-orange/10 h-8 px-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Añadir franja
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <span className="text-gray-500 italic px-4 py-2">Cerrado</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
