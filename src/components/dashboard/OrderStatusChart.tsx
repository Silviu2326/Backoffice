import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Pendiente', value: 300, color: '#FFBB28' },
  { name: 'Pagado', value: 500, color: '#00C49F' },
  { name: 'Enviado', value: 200, color: '#FF8042' },
  { name: 'Completado', value: 400, color: '#0088FE' },
];

const RADIAN = Math.PI / 180;
interface PieLabelRenderProps { cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number; index?: number; value?: number; payload?: { name: string; value: number; color: string; }; }

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
  if (cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || percent === undefined) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CustomTooltipProps { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload: { name: string; value: number; color: string; } }>; label?: string; }

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const percentage = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
        <p className="text-sm font-semibold mb-1">{payload[0].name}</p>
        <p className="text-lg font-bold text-[#F76934]">{payload[0].value} ({percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function OrderStatusChart() {
  const totalOrders = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="w-full h-full min-h-[350px] bg-[#2C2C2C] p-6 rounded-xl shadow-lg border border-white/5 flex flex-col">
      <h3 className="text-lg font-bold text-white mb-4">Estado de Pedidos</h3>
      <div className="flex-grow flex justify-center items-center">
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              stroke="none" 
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="w-40 ml-4">
          {data.map((entry, index) => {
            const percentage = ((entry.value / totalOrders) * 100).toFixed(1);
            return (
              <div key={`legend-${index}`} className="flex items-center mb-2">
                <span className="w-3 h-3 rounded-full mr-2 shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-sm text-text-secondary">{entry.name}: <span className="text-white font-medium">{entry.value}</span></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
