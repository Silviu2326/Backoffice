import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Filter } from 'lucide-react';

const data = [
  { name: 'Visitas App', value: 12500, fill: '#6366F1' },
  { name: 'Añadir Carrito', value: 4200, fill: '#818CF8' },
  { name: 'Checkout', value: 1800, fill: '#A5B4FC' },
  { name: 'Pago Éxito', value: 950, fill: '#4CAF50' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 p-2 rounded shadow-xl">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-brand-orange text-sm">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function FunnelChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
         <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Filter className="h-5 w-5 text-indigo-400" />
          Embudo de Conversión
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
