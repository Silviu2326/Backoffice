import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data generator for the last 30 days
const generateData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      revenue: Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000, // Random revenue
    });
  }
  return data;
};

const data = generateData();

interface CustomTooltipProps { active?: boolean; payload?: Array<{ value: number; name: string; }>; label?: string; }

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-[#F76934]">
          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <div className="w-full h-full min-h-[350px] bg-[#2C2C2C] p-6 rounded-xl shadow-lg border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Evolución de Ventas</h3>
        <select className="text-sm bg-[#1E1E1E] border-white/10 rounded-lg text-text-secondary focus:ring-[#F76934] focus:border-[#F76934] p-2 outline-none">
          <option>Últimos 30 días</option>
          <option>Últimos 7 días</option>
          <option>Este año</option>
        </select>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F76934" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F76934" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3A3A3A" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `€${value/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#F76934" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
