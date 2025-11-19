import { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal, ModalHeader, ModalBody } from '../../components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { 
  Plus, 
  Target, 
  Send, 
  Users, 
  Clock, 
  Edit2, 
  Check, 
  ChevronRight,
  FileText,
  Smartphone,
  Mail,
  MessageSquare,
  LayoutTemplate,
  Eye,
  ArrowUpRight,
  Filter,
  Search,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

// --- Mock Data & Types ---

interface Campaign {
  id: string;
  name: string;
  subject?: string;
  content?: string;
  type: 'email' | 'push' | 'sms';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  segment: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  revenue: number;
  scheduledDate: string; // YYYY-MM-DD HH:mm
  createdAt: string;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Oferta Verano VIP',
    subject: '¡El verano ya está aquí! ☀️',
    content: 'Disfruta de un 20% de descuento exclusivo en nuestra colección de verano. Solo por tiempo limitado.',
    type: 'email',
    status: 'completed',
    segment: 'Clientes VIP',
    sentCount: 1250,
    openRate: 45.2,
    clickRate: 12.5,
    revenue: 5400,
    scheduledDate: '2023-06-15 10:00',
    createdAt: '2023-06-10',
  },
  {
    id: '2',
    name: 'Recordatorio Carrito',
    type: 'push',
    content: '¡No olvides tus items! Tu carrito te está esperando 🛒',
    status: 'active',
    segment: 'Usuarios Activos',
    sentCount: 340,
    openRate: 62.1,
    clickRate: 28.4,
    revenue: 1200,
    scheduledDate: 'Automático',
    createdAt: '2023-01-15',
  },
  {
    id: '3',
    name: 'Lanzamiento Nueva Colección',
    subject: 'Descubre lo nuevo ✨',
    content: 'Las nuevas tendencias han llegado. Sé el primero en verlas.',
    type: 'email',
    status: 'draft',
    segment: 'Todos los Clientes',
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    revenue: 0,
    scheduledDate: '2023-11-20 09:00',
    createdAt: '2023-11-10',
  },
  {
    id: '4',
    name: 'Descuento Cumpleaños',
    type: 'sms',
    content: '¡Feliz Cumpleaños! 🎂 Aquí tienes un regalo: usa el código BDAY23 para 10€ de descuento.',
    status: 'active',
    segment: 'Cumpleañeros',
    sentCount: 50,
    openRate: 98.0,
    clickRate: 45.0,
    revenue: 850,
    scheduledDate: 'Automático',
    createdAt: '2023-02-01',
  },
  {
    id: '5',
    name: 'Flash Sale Black Friday',
    subject: '¡Solo por 24 horas! ⏰',
    content: 'El Black Friday comienza YA. Descuentos de hasta el 50%.',
    type: 'email',
    status: 'scheduled',
    segment: 'Todos los Clientes',
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    revenue: 0,
    scheduledDate: '2023-11-24 00:00',
    createdAt: '2023-11-20',
  },
  {
    id: '6',
    name: 'Encuesta de Satisfacción',
    subject: 'Tu opinión nos importa',
    content: 'Ayúdanos a mejorar. Responde esta breve encuesta y gana puntos.',
    type: 'email',
    status: 'completed',
    segment: 'Compradores Recientes',
    sentCount: 500,
    openRate: 35.0,
    clickRate: 15.0,
    revenue: 0,
    scheduledDate: '2023-10-10 14:00',
    createdAt: '2023-10-01',
  },
];

const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Día ${i + 1}`,
  sent: Math.floor(Math.random() * 5000) + 1000,
  opened: Math.floor(Math.random() * 3000) + 500,
  clicked: Math.floor(Math.random() * 1000) + 100,
}));

const CHANNEL_DATA = [
  { name: 'Email', value: 65, color: '#F76934' },
  { name: 'Push', value: 25, color: '#818CF8' },
  { name: 'SMS', value: 10, color: '#34D399' },
];

const TEMPLATES = [
  { id: 1, name: 'Newsletter Clásica', type: 'email', thumbnail: 'bg-gray-700' },
  { id: 2, name: 'Oferta Flash', type: 'email', thumbnail: 'bg-orange-900' },
  { id: 3, name: 'Bienvenida', type: 'email', thumbnail: 'bg-blue-900' },
  { id: 4, name: 'Notificación Simple', type: 'push', thumbnail: 'bg-gray-800' },
  { id: 5, name: 'Alerta de Stock', type: 'push', thumbnail: 'bg-red-900' },
  { id: 6, name: 'Texto Promocional', type: 'sms', thumbnail: 'bg-green-900' },
];

// --- Components ---

const EngagementChart = () => (
  <div className="h-[350px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F76934" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F76934" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3A3A3A" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} hide />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
          itemStyle={{ color: '#F3F4F6' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Area type="monotone" dataKey="sent" name="Enviados" stroke="#6B7280" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
        <Area type="monotone" dataKey="opened" name="Abiertos" stroke="#F59E0B" fillOpacity={1} fill="url(#colorOpened)" strokeWidth={2} />
        <Area type="monotone" dataKey="clicked" name="Clicks" stroke="#F76934" fillOpacity={1} fill="url(#colorClicked)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const ChannelDistributionChart = () => (
  <div className="h-[250px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={CHANNEL_DATA}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {CHANNEL_DATA.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
           contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
           itemStyle={{ color: '#fff' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const CalendarView = ({ campaigns }: { campaigns: Campaign[] }) => {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  const today = new Date().getDate();
  
  return (
    <div className="grid grid-cols-7 gap-2 md:gap-4">
      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
        <div key={d} className="text-center text-xs md:text-sm font-medium text-text-secondary py-2">{d}</div>
      ))}
      {days.map(day => {
        const dayNum = day > 30 ? day - 30 : day;
        const isToday = day === today;
        const campaignsOnDay = campaigns.filter(c => c.scheduledDate.includes(`2023-11-${String(dayNum).padStart(2, '0')}`));
        
        return (
          <div key={day} className={`min-h-[80px] md:min-h-[120px] rounded-lg border p-2 transition-colors hover:bg-white/5 ${isToday ? 'bg-white/5 border-brand-orange' : 'bg-[#1E1E1E] border-white/5'}`}>
            <div className={`text-right text-xs md:text-sm mb-2 ${isToday ? 'text-brand-orange font-bold' : 'text-text-secondary'}`}>{dayNum}</div>
            <div className="space-y-1">
              {campaignsOnDay.map(c => (
                <div key={c.id} className="text-[10px] md:text-xs truncate p-1 rounded bg-white/10 text-white border-l-2 border-brand-orange cursor-pointer hover:bg-white/20">
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Wizard Components ---

const CampaignPreview = ({ type, title, content }: { type: string, title: string, content: string }) => {
  if (type === 'email') {
    return (
      <div className="bg-white rounded-md overflow-hidden text-black shadow-xl max-w-[300px] mx-auto transform scale-90 md:scale-100 transition-transform">
         <div className="bg-gray-100 p-3 border-b border-gray-200 flex gap-2 items-center">
            <div className="h-2 w-2 rounded-full bg-red-400"/>
            <div className="h-2 w-2 rounded-full bg-yellow-400"/>
            <div className="h-2 w-2 rounded-full bg-green-400"/>
            <div className="ml-2 text-[10px] text-gray-500 flex-1 truncate">Asunto: {title || 'Sin asunto'}</div>
         </div>
         <div className="p-4 space-y-4 min-h-[240px] bg-white">
            <div className="h-8 w-full bg-gray-100 rounded animate-pulse" />
            <div className="space-y-2">
               <div className="h-2 w-full bg-gray-100 rounded" />
               <div className="h-2 w-5/6 bg-gray-100 rounded" />
               <div className="h-2 w-4/6 bg-gray-100 rounded" />
            </div>
            <div className="p-2 text-sm text-gray-800 border border-gray-100 rounded bg-gray-50 min-h-[80px]">
              {content || <span className="text-gray-400 italic">El contenido de tu email aparecerá aquí...</span>}
            </div>
            <div className="h-8 w-32 mx-auto bg-brand-orange rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">
              Ver Oferta
            </div>
         </div>
      </div>
    );
  }
  if (type === 'push') {
     return (
      <div className="bg-[#121212] rounded-[2rem] border-[6px] border-gray-800 p-4 w-[260px] mx-auto relative shadow-2xl">
         <div className="h-5 w-1/3 bg-black rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2"/>
         <div className="mt-8 space-y-4">
            {/* Notification Bubble */}
            <div className="bg-[#1E1E1E] rounded-2xl p-4 backdrop-blur-md border border-white/10 shadow-lg">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded bg-brand-orange flex items-center justify-center text-[10px] text-white font-bold">C</div>
                  <span className="text-[11px] text-gray-400 font-medium uppercase">CoolCat • Ahora</span>
               </div>
               <div className="text-sm font-bold text-white mb-1 leading-tight">{title || 'Título de la notificación'}</div>
               <div className="text-xs text-gray-300 leading-relaxed">{content || 'El cuerpo de tu notificación aparecerá aquí...'}</div>
            </div>
            {/* Background Context */}
            <div className="bg-white/5 h-48 rounded-xl animate-pulse" />
         </div>
      </div>
     );
  }
  // SMS
  return (
    <div className="bg-white rounded-[2.5rem] border-[6px] border-gray-300 p-4 w-[260px] mx-auto relative shadow-xl text-black h-[400px] flex flex-col overflow-hidden">
        <div className="text-center text-xs font-bold text-gray-400 border-b border-gray-100 pb-3 mb-4 flex justify-center items-center gap-1">
          <div className="w-8 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col justify-end space-y-3 pb-4 overflow-y-auto">
           <div className="text-[10px] text-gray-400 text-center mb-2">Hoy 10:23 AM</div>
           <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] self-start text-xs shadow-sm">
              <p>Hola, ¿cuándo sale la nueva colección?</p>
           </div>
           <div className="bg-brand-orange text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] self-end text-xs shadow-md">
              <p>{content || 'Escribe tu mensaje SMS para previsualizarlo aquí...'}</p>
              {title && <div className="font-bold mt-2 block opacity-90 text-[10px] uppercase tracking-wider border-t border-white/20 pt-1">{title}</div>}
           </div>
           <div className="text-[10px] text-gray-400 text-right px-1">Enviado</div>
        </div>
    </div>
  );
};

const CampaignWizard = ({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Campaign) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<Campaign>>({ 
    type: 'email', 
    name: '', 
    segment: 'all', 
    status: 'scheduled',
    content: '',
    subject: ''
  });

  const steps = [
    { id: 1, title: 'Detalles', icon: FileText },
    { id: 2, title: 'Plantilla', icon: LayoutTemplate },
    { id: 3, title: 'Audiencia', icon: Users },
    { id: 4, title: 'Contenido', icon: Edit2 },
    { id: 5, title: 'Programar', icon: Clock },
  ];

  const isStepValid = () => {
    if (step === 1) return !!data.name && data.name.length > 3;
    if (step === 4) return !!data.content && data.content.length > 10;
    return true;
  };

  const nextStep = () => {
    if (isStepValid()) setStep(s => Math.min(s + 1, 5));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = () => {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Nueva Campaña',
      subject: data.subject,
      content: data.content,
      type: data.type || 'email',
      status: 'scheduled',
      segment: data.segment || 'all',
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      revenue: 0,
      scheduledDate: '2023-11-30 10:00', // Mock date
      createdAt: new Date().toISOString().split('T')[0],
    };
    onCreate(newCampaign);
  };

  return (
    <div className="flex flex-col h-[650px]">
      {/* Stepper */}
      <div className="flex items-center justify-between px-4 md:px-12 py-6 border-b border-white/5 bg-[#1E1E1E]">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 group">
            <div 
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                step >= s.id 
                  ? 'bg-brand-orange border-brand-orange text-white shadow-[0_0_15px_rgba(247,105,52,0.4)]' 
                  : 'bg-[#2C2C2C] border-white/10 text-text-secondary group-hover:border-white/30'
              }`}
            >
              {step > s.id ? <Check size={18} /> : <s.icon size={16} />}
            </div>
            <span className={`text-[10px] md:text-xs font-medium hidden md:block transition-colors ${step >= s.id ? 'text-white' : 'text-text-secondary'}`}>{s.title}</span>
            {i < steps.length - 1 && (
              <div className={`absolute top-4 md:top-5 left-1/2 h-[2px] -z-10 transition-all duration-500 ${step > i + 1 ? 'bg-brand-orange' : 'bg-[#333]'} w-[calc(100%)]`} style={{ width: 'calc(100% + 2rem)' }} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#1A1A1A]">
        {step === 1 && (
          <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2 text-center">
               <h2 className="text-2xl font-bold text-white">Configuración Inicial</h2>
               <p className="text-text-secondary">Define el nombre y el canal principal de tu nueva campaña.</p>
            </div>
            
            <div className="space-y-4 bg-[#2C2C2C] p-6 rounded-xl border border-white/5">
              <Input 
                label="Nombre de la campaña" 
                placeholder="Ej: Newsletter Mensual - Noviembre" 
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
              />
              
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-text-secondary">Canal de Envío</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'email', label: 'Email Marketing', icon: Mail, desc: 'Boletines, ofertas.' },
                    { id: 'push', label: 'Push Notification', icon: Smartphone, desc: 'Alertas en app.' },
                    { id: 'sms', label: 'Mensaje SMS', icon: MessageSquare, desc: 'Urgente y directo.' }
                  ].map((channel) => (
                    <div 
                      key={channel.id}
                      className={`cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden ${
                        data.type === channel.id 
                          ? 'border-brand-orange bg-brand-orange/10 ring-1 ring-brand-orange' 
                          : 'border-white/10 bg-[#222] hover:bg-white/5'
                      }`}
                      onClick={() => setData({...data, type: channel.id as any})}
                    >
                      {data.type === channel.id && (
                        <div className="absolute top-2 right-2 text-brand-orange"><Check size={14} /></div>
                      )}
                      <channel.icon className={`mb-3 h-6 w-6 ${data.type === channel.id ? 'text-brand-orange' : 'text-text-secondary'}`} />
                      <div className="font-medium text-white">{channel.label}</div>
                      <div className="text-xs text-text-secondary mt-1">{channel.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <div>
                    <h2 className="text-xl font-bold text-white">Elige una plantilla</h2>
                    <p className="text-text-secondary text-sm">Filtra por tipo de campaña: <span className="capitalize text-brand-orange font-medium">{data.type}</span></p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {TEMPLATES.filter(t => t.type === data.type).map(template => (
                    <div key={template.id} className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-brand-orange transition-all hover:shadow-xl bg-[#2C2C2C] flex flex-col">
                       <div className={`h-40 w-full ${template.thumbnail} flex items-center justify-center relative`}>
                          <LayoutTemplate className="text-white/20 h-12 w-12 group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">Usar Plantilla</Button>
                          </div>
                       </div>
                       <div className="p-4 flex-1">
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <p className="text-xs text-text-secondary mt-1">Optimizado para conversión</p>
                       </div>
                    </div>
                 ))}
                  <div className="cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-brand-orange/50 transition-all bg-transparent flex flex-col items-center justify-center min-h-[200px] group">
                       <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-brand-orange/20 transition-colors">
                          <Plus className="text-text-secondary group-hover:text-brand-orange" />
                       </div>
                       <span className="text-sm font-medium text-text-secondary group-hover:text-white">Crear desde cero</span>
                  </div>
              </div>
           </div>
        )}

        {step === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-white">Segmentación de Audiencia</h2>
            
            <div className="bg-[#2C2C2C] p-6 rounded-xl border border-white/5 space-y-6">
              <Select
                label="Seleccionar Segmento"
                options={[
                  { value: 'all', label: 'Todos los Usuarios (45k)' },
                  { value: 'vip', label: 'Clientes VIP (Gastos > 500€)' },
                  { value: 'inactive', label: 'Usuarios Inactivos (30 días)' },
                  { value: 'cart_abandoned', label: 'Carrito Abandonado (Alta Intención)' },
                  { value: 'birthday', label: 'Cumpleañeros del Mes' },
                ]}
                value={data.segment}
                onChange={val => setData({...data, segment: val})}
              />
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
                   <div className="relative z-10">
                     <h4 className="text-xs text-text-secondary uppercase tracking-wider mb-1">Alcance Estimado</h4>
                     <p className="text-3xl font-bold text-white tracking-tight">1,240</p>
                     <p className="text-xs text-green-400 flex items-center gap-1 mt-1"><ArrowUpRight size={12}/> +12% vs mes pasado</p>
                   </div>
                   <div className="h-16 w-16 rounded-full bg-brand-orange/10 absolute -right-4 -bottom-4 flex items-center justify-center text-brand-orange/50 group-hover:scale-110 transition-transform">
                     <Users size={32} />
                   </div>
                 </div>
                 <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
                    <h4 className="text-xs text-text-secondary uppercase tracking-wider mb-2">Características</h4>
                    <div className="flex flex-wrap gap-2">
                       <Badge variant="default" className="bg-white/10 text-white border-0">Activos</Badge>
                       <Badge variant="default" className="bg-white/10 text-white border-0">España</Badge>
                       <Badge variant="default" className="bg-white/10 text-white border-0">Mobile</Badge>
                    </div>
                 </div>
              </div>

               <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-blue-400 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-blue-200 font-medium">Recomendación de IA</p>
                    <p className="text-xs text-blue-300 mt-1">
                       Este segmento suele tener una tasa de apertura un <strong>15% mayor</strong> si envías la campaña los Martes a las 10:00 AM.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex-1 space-y-6">
                <div>
                   <h2 className="text-xl font-bold text-white mb-1">Diseña tu Contenido</h2>
                   <p className="text-text-secondary text-sm">Personaliza el mensaje para tu audiencia.</p>
                </div>
                
                <div className="bg-[#2C2C2C] p-6 rounded-xl border border-white/5 space-y-5">
                  <Input 
                    label={data.type === 'email' ? 'Asunto del Correo' : 'Título de la Notificación'}
                    placeholder={data.type === 'email' ? '¡No te lo pierdas!' : 'Nueva oferta disponible'}
                    value={data.subject || ''}
                    onChange={(e) => setData({...data, subject: e.target.value})}
                  />
                  
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-text-secondary">
                      Cuerpo del Mensaje
                      <span className="float-right text-xs text-text-muted">{data.content?.length || 0} caracteres</span>
                    </label>
                    <textarea 
                      className="w-full min-h-[250px] flex-1 rounded-lg bg-[#1A1A1A] px-4 py-3 text-white placeholder:text-text-muted border border-white/10 outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange resize-none font-mono text-sm transition-all"
                      placeholder="Escribe tu mensaje aquí... Puedes usar variables como {{nombre}}."
                      value={data.content}
                      onChange={(e) => setData({...data, content: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto py-2">
                     {['{{nombre}}', '{{apellido}}', '{{cupon}}', '{{puntos}}'].map(tag => (
                        <button key={tag} onClick={() => setData({...data, content: (data.content || '') + ' ' + tag})} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-brand-orange font-mono transition-colors">
                           {tag}
                        </button>
                     ))}
                  </div>
                </div>
             </div>
             
             <div className="w-full lg:w-[380px] flex flex-col">
                <div className="bg-[#1E1E1E] rounded-2xl border border-white/10 p-6 flex flex-col sticky top-4">
                  <div className="text-xs text-text-secondary text-center mb-6 flex items-center justify-center gap-2">
                     <Eye size={14}/> Vista Previa en Dispositivo
                  </div>
                  <div className="flex-1 flex items-center justify-center py-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-900 rounded-xl border border-white/5">
                     <CampaignPreview type={data.type || 'email'} title={data.subject || ''} content={data.content || ''} />
                  </div>
                  <div className="mt-4 text-center">
                     <p className="text-xs text-text-muted">La vista previa es aproximada.</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center space-y-3">
                <div className="h-20 w-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-500/5">
                   <Check size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white font-display">¡Todo listo!</h2>
                <p className="text-text-secondary">Revisa los detalles antes de programar el lanzamiento.</p>
             </div>

            <div className="bg-[#2C2C2C] rounded-xl overflow-hidden border border-white/10 divide-y divide-white/5 shadow-2xl">
               <div className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <span className="text-text-secondary flex items-center gap-3 text-sm"><FileText size={18}/> Nombre de Campaña</span>
                  <span className="text-white font-medium text-right">{data.name || 'Sin nombre'}</span>
               </div>
               <div className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <span className="text-text-secondary flex items-center gap-3 text-sm"><LayoutTemplate size={18}/> Canal</span>
                  <span className="text-white font-medium capitalize flex items-center gap-2">
                     {data.type === 'email' ? <Mail size={16} className="text-brand-orange"/> : data.type === 'push' ? <Smartphone size={16} className="text-brand-orange"/> : <MessageSquare size={16} className="text-brand-orange"/>}
                     {data.type === 'email' ? 'Email Marketing' : data.type === 'push' ? 'Push Notification' : 'SMS'}
                  </span>
               </div>
               <div className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <span className="text-text-secondary flex items-center gap-3 text-sm"><Users size={18}/> Audiencia</span>
                  <span className="text-white font-medium">{data.segment}</span>
               </div>
               <div className="p-5 hover:bg-white/5 transition-colors">
                  <span className="text-text-secondary flex items-center gap-3 text-sm mb-2"><Edit2 size={18}/> Contenido</span>
                  <p className="text-sm text-white/80 italic line-clamp-2 pl-8 border-l-2 border-brand-orange/30">"{data.content}"</p>
               </div>
            </div>
            
            <div className="bg-brand-surface/50 border border-brand-orange/20 rounded-xl p-6">
               <label className="block text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Clock size={16} className="text-brand-orange"/> Programar Lanzamiento
               </label>
               <div className="flex gap-4">
                  <Input type="date" className="bg-[#1A1A1A]" />
                  <Input type="time" className="bg-[#1A1A1A]" />
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 flex justify-between bg-[#1E1E1E] items-center">
        <Button variant="ghost" onClick={step === 1 ? onClose : prevStep} className="text-text-secondary hover:text-white">
          {step === 1 ? 'Cancelar' : 'Atrás'}
        </Button>
        
        <div className="flex gap-2">
          {step === 5 && (
             <Button variant="secondary" onClick={() => { /* Save draft logic */ onClose(); }}>
                Guardar Borrador
             </Button>
          )}
          <Button 
            onClick={step === 5 ? handleFinish : nextStep} 
            className="px-8 min-w-[140px]"
            disabled={!isStepValid()}
          >
            {step === 5 ? 'Programar Campaña' : 'Siguiente'}
            {step < 5 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CampaignDetailModal = ({ campaign, onClose }: { campaign: Campaign | null, onClose: () => void }) => {
   if (!campaign) return null;

   return (
      <Modal isOpen={!!campaign} onClose={onClose}>
         <div className="w-[800px] max-w-[95vw]">
            <ModalHeader>
               <div className="flex items-center gap-3">
                  <Badge variant="default" className="capitalize">{campaign.type}</Badge>
                  <span className="font-display text-xl">{campaign.name}</span>
               </div>
            </ModalHeader>
            <ModalBody>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="bg-[#1A1A1A] border-white/5">
                     <CardContent className="p-4">
                        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium mb-1">Enviados</p>
                        <p className="text-2xl font-bold text-white">{campaign.sentCount.toLocaleString()}</p>
                     </CardContent>
                  </Card>
                  <Card className="bg-[#1A1A1A] border-white/5">
                     <CardContent className="p-4">
                        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium mb-1">Tasa Apertura</p>
                        <p className="text-2xl font-bold text-green-400">{campaign.openRate}%</p>
                     </CardContent>
                  </Card>
                  <Card className="bg-[#1A1A1A] border-white/5">
                     <CardContent className="p-4">
                        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium mb-1">Ingresos</p>
                        <p className="text-2xl font-bold text-brand-orange">{campaign.revenue}€</p>
                     </CardContent>
                  </Card>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <h4 className="text-white font-medium mb-3 border-b border-white/10 pb-2">Detalles de Configuración</h4>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex justify-between py-2 border-b border-white/5">
                           <span className="text-text-secondary">Fecha Programada:</span>
                           <span className="text-white font-medium">{campaign.scheduledDate}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                           <span className="text-text-secondary">Segmento:</span>
                           <span className="text-white font-medium">{campaign.segment}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                           <span className="text-text-secondary">Asunto:</span>
                           <span className="text-white font-medium">{campaign.subject || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                           <span className="text-text-secondary">Estado Actual:</span>
                           <span className="capitalize text-white font-medium">{campaign.status}</span>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-white font-medium mb-3 border-b border-white/10 pb-2">Contenido del Mensaje</h4>
                     <div className="bg-[#1A1A1A] p-4 rounded-lg border border-white/5 text-sm text-gray-300 italic">
                        "{campaign.content || 'Sin contenido registrado'}"
                     </div>
                  </div>
               </div>
               
               <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cerrar</Button>
                  <Button variant="secondary">Duplicar Campaña</Button>
                  <Button>Ver Informe Completo</Button>
               </div>
            </ModalBody>
         </div>
      </Modal>
   );
};

const CampaignManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns([newCampaign, ...campaigns]);
    setIsCreateModalOpen(false);
  };

  const filteredCampaigns = campaigns.filter(c => {
     const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.segment.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesType = filterType === 'all' || c.type === filterType;
     const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
     return matchesSearch && matchesType && matchesStatus;
  });

  // --- Columns ---
  const columns: Column<Campaign>[] = useMemo(() => [
    {
      header: 'Campaña',
      render: (campaign) => (
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            campaign.type === 'email' ? 'bg-blue-500/10 text-blue-400' :
            campaign.type === 'push' ? 'bg-purple-500/10 text-purple-400' :
            'bg-green-500/10 text-green-400'
          }`}>
            {campaign.type === 'email' ? <Mail size={22} /> : 
             campaign.type === 'push' ? <Smartphone size={22} /> : 
             <MessageSquare size={22} />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate text-base">{campaign.name}</p>
            <p className="text-xs text-text-secondary truncate max-w-[240px] mt-0.5">{campaign.subject || campaign.segment}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Estado',
      render: (campaign) => {
        const variants: Record<string, "default" | "brand" | "success" | "warning" | "danger"> = {
          draft: 'default',
          scheduled: 'brand',
          active: 'success',
          completed: 'default'
        };
        const labels = {
          draft: 'Borrador',
          scheduled: 'Programado',
          active: 'En Curso',
          completed: 'Completado'
        };
        return <Badge variant={variants[campaign.status]}>{labels[campaign.status]}</Badge>;
      },
    },
    {
      header: 'Métricas',
      render: (c) => (
        <div className="flex gap-8 text-xs">
          <div className="flex flex-col">
             <span className="text-text-secondary mb-1 uppercase tracking-wider font-medium text-[10px]">Open Rate</span>
             <span className={`font-bold text-sm ${c.openRate > 40 ? 'text-green-400' : 'text-white'}`}>{c.openRate > 0 ? c.openRate + '%' : '-'}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-text-secondary mb-1 uppercase tracking-wider font-medium text-[10px]">Click Rate</span>
             <span className="font-bold text-white text-sm">{c.clickRate > 0 ? c.clickRate + '%' : '-'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Revenue',
      render: (c) => (
         <div className="font-mono text-sm text-white font-medium">
            {c.revenue > 0 ? `${c.revenue.toLocaleString()}€` : '-'}
         </div>
      )
    },
    {
      header: 'Fecha',
      render: (c) => (
        <div className="text-right">
           <div className="text-sm text-white font-medium">{c.scheduledDate.split(' ')[0]}</div>
           <div className="text-xs text-text-secondary">{c.scheduledDate.split(' ')[1] || ''}</div>
        </div>
      ),
      className: 'text-right'
    },
    {
      header: '',
      render: (c) => (
        <div className="flex justify-end gap-2">
           <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(c)} className="hover:bg-white/10 text-text-secondary hover:text-white">
              <Eye size={18} />
           </Button>
           <Button variant="ghost" size="sm" className="hover:bg-white/10 text-text-secondary hover:text-white">
              <MoreHorizontal size={18} />
           </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white font-display tracking-tight">Marketing Hub</h1>
          <p className="text-text-secondary mt-2 text-lg">Gestiona, optimiza y analiza tus campañas multicanal desde un solo lugar.</p>
        </div>
        <div className="flex gap-4">
            <Button variant="secondary" className="h-12 px-6">
               <Filter className="mr-2 h-5 w-5" /> Reportes Avanzados
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-white h-12 px-6 shadow-lg shadow-brand-orange/20">
               <Plus className="mr-2 h-5 w-5" />
               Crear Campaña
            </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
         <TabsList className="bg-[#1A1A1A] border border-white/5 p-1.5 rounded-xl inline-flex h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#2C2C2C] data-[state=active]:text-white text-text-secondary px-6 py-2.5 rounded-lg transition-all">Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-[#2C2C2C] data-[state=active]:text-white text-text-secondary px-6 py-2.5 rounded-lg transition-all">Campañas</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-[#2C2C2C] data-[state=active]:text-white text-text-secondary px-6 py-2.5 rounded-lg transition-all">Calendario</TabsTrigger>
         </TabsList>

         <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <Card className="border-t-4 border-t-brand-orange bg-[#2C2C2C]/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-brand-orange/10 text-brand-orange"><Send size={24}/></div>
                        <Badge variant="success" className="bg-green-500/20 text-green-400 border-0">+12.5%</Badge>
                     </div>
                     <p className="text-sm text-text-secondary font-medium uppercase tracking-wide">Emails Enviados (Mes)</p>
                     <p className="text-4xl font-bold text-white font-display mt-1">45.2k</p>
                  </CardContent>
               </Card>
               <Card className="border-t-4 border-t-blue-500 bg-[#2C2C2C]/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Target size={24}/></div>
                        <Badge variant="success" className="bg-green-500/20 text-green-400 border-0">+5.2%</Badge>
                     </div>
                     <p className="text-sm text-text-secondary font-medium uppercase tracking-wide">Tasa Apertura Global</p>
                     <p className="text-4xl font-bold text-white font-display mt-1">32.4%</p>
                  </CardContent>
               </Card>
               <Card className="border-t-4 border-t-green-500 bg-[#2C2C2C]/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500"><Users size={24}/></div>
                        <Badge variant="warning" className="bg-yellow-500/20 text-yellow-400 border-0">-1.2%</Badge>
                     </div>
                     <p className="text-sm text-text-secondary font-medium uppercase tracking-wide">Conversión</p>
                     <p className="text-4xl font-bold text-white font-display mt-1">4.2%</p>
                  </CardContent>
               </Card>
               <Card className="border-t-4 border-t-purple-500 bg-[#2C2C2C]/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><Smartphone size={24}/></div>
                        <Badge variant="success" className="bg-green-500/20 text-green-400 border-0">+8.4%</Badge>
                     </div>
                     <p className="text-sm text-text-secondary font-medium uppercase tracking-wide">Push Click Rate</p>
                     <p className="text-4xl font-bold text-white font-display mt-1">12.8%</p>
                  </CardContent>
               </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 border-white/5 bg-[#2C2C2C]/50">
                  <CardHeader>
                     <CardTitle>Rendimiento de Engagement</CardTitle>
                     <CardDescription>Métricas de interacción en los últimos 30 días.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <EngagementChart />
                  </CardContent>
               </Card>
               <div className="space-y-8">
                  <Card className="border-white/5 bg-[#2C2C2C]/50">
                     <CardHeader>
                        <CardTitle>Distribución por Canal</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ChannelDistributionChart />
                     </CardContent>
                  </Card>
                  <Card className="border-white/5 bg-[#2C2C2C]/50">
                     <CardHeader>
                        <CardTitle className="text-base">Próximos Envíos</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-0">
                        {campaigns.filter(c => c.status === 'scheduled').slice(0, 3).map(c => (
                           <div key={c.id} className="flex gap-4 items-center border-b border-white/5 py-4 last:border-0 last:pb-0 first:pt-0">
                              <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0 text-brand-orange">
                                 <Clock size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="text-sm text-white font-bold truncate">{c.name}</p>
                                 <p className="text-xs text-text-secondary mt-0.5">{c.scheduledDate}</p>
                              </div>
                              <Badge variant="brand" className="shrink-0">Programado</Badge>
                           </div>
                        ))}
                        {campaigns.filter(c => c.status === 'scheduled').length === 0 && (
                           <p className="text-sm text-text-muted text-center py-8">No hay campañas programadas</p>
                        )}
                     </CardContent>
                  </Card>
               </div>
            </div>
         </TabsContent>

         <TabsContent value="campaigns" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#2C2C2C] p-4 rounded-xl border border-white/5">
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input 
                     type="text" 
                     placeholder="Buscar por nombre o segmento..." 
                     className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange placeholder:text-text-muted"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <Select 
                     value={filterType} 
                     options={[
                        {label: 'Todos los Canales', value: 'all'}, 
                        {label: 'Email Marketing', value: 'email'},
                        {label: 'Push Notifications', value: 'push'},
                        {label: 'SMS', value: 'sms'}
                     ]} 
                     className="w-full md:w-[200px]"
                     onChange={setFilterType} 
                  />
                  <Select 
                     value={filterStatus} 
                     options={[
                        {label: 'Todos los Estados', value: 'all'}, 
                        {label: 'Activas', value: 'active'},
                        {label: 'Completadas', value: 'completed'},
                        {label: 'Programadas', value: 'scheduled'},
                        {label: 'Borradores', value: 'draft'}
                     ]} 
                     className="w-full md:w-[200px]"
                     onChange={setFilterStatus}
                  />
               </div>
            </div>
            <Card className="border-none bg-transparent shadow-none">
               <DataTable data={filteredCampaigns} columns={columns} />
            </Card>
         </TabsContent>

         <TabsContent value="calendar">
            <Card className="border-white/5 bg-[#2C2C2C]/50">
               <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                  <CardTitle>Calendario de Marketing</CardTitle>
                  <div className="flex gap-3">
                     <Button variant="ghost" size="sm">Hoy</Button>
                     <Badge variant="default" className="text-sm px-4 py-1.5 bg-brand-orange/10 text-brand-orange border-brand-orange/20">Noviembre 2023</Badge>
                  </div>
               </CardHeader>
               <CardContent className="pt-6">
                  <CalendarView campaigns={campaigns} />
               </CardContent>
            </Card>
         </TabsContent>
      </Tabs>

      {/* Modals */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="w-[1000px] max-w-[95vw] h-[90vh] md:h-auto flex flex-col bg-[#121212] shadow-2xl rounded-xl overflow-hidden">
           <ModalHeader className="border-b border-white/5 bg-[#1A1A1A] py-4">
              <span className="font-display text-xl">Nueva Campaña</span>
           </ModalHeader>
           <ModalBody className="flex-1 overflow-hidden p-0">
              <CampaignWizard onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateCampaign} />
           </ModalBody>
        </div>
      </Modal>

      <CampaignDetailModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
    </div>
  );
};

export default CampaignManager;