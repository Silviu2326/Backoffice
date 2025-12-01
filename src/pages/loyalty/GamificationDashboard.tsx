import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { 
  Trophy, 
  Target, 
  Settings, 
  Plus, 
  Trash2, 
  Medal, 
  Users, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Crown, 
  Search, 
  Filter,
  Gamepad2,
  Gift,
  Loader2,
  Edit2,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table/Table';
import BadgeEditor from './BadgeEditor';
import { RulesConfig } from './RulesConfig';
import { 
  getAllRewards, 
  createReward, 
  updateReward, 
  deleteReward,
  getRewardsByCategory 
} from '../../features/gamification/api/rewardService';
import { Reward } from '../../types/core';

// --- Types ---
interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  status: 'active' | 'inactive';
  icon: string;
  progress?: number; // Mocked progress for visualization
  participants?: number;
}

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: string;
  trend: 'up' | 'down' | 'stable';
  achievements: number;
}

interface Level {
  id: string;
  name: string;
  minPoints: number;
  color: string;
  icon: any;
  benefits: string[];
  usersCount: number;
}

// --- Mock Data ---
const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Comprador Diario', description: 'Realiza una compra hoy', reward: 50, type: 'daily', status: 'active', icon: '🛍️', progress: 65, participants: 120 },
  { id: '2', title: 'Semana de Lujo', description: 'Gasta más de 100€ esta semana', reward: 200, type: 'weekly', status: 'active', icon: '💎', progress: 32, participants: 85 },
  { id: '3', title: 'Reseñador Top', description: 'Escribe 5 reseñas este mes', reward: 500, type: 'monthly', status: 'inactive', icon: '✍️', progress: 0, participants: 0 },
  { id: '4', title: 'Invita un Amigo', description: 'Trae un nuevo usuario a la app', reward: 300, type: 'milestone', status: 'active', icon: '🤝', progress: 12, participants: 450 },
];

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'Maria García', avatar: 'https://i.pravatar.cc/150?u=1', points: 15420, level: 'Diamante', trend: 'up', achievements: 12 },
  { id: '2', rank: 2, name: 'Juan Pérez', avatar: 'https://i.pravatar.cc/150?u=2', points: 12350, level: 'Platino', trend: 'stable', achievements: 8 },
  { id: '3', rank: 3, name: 'Ana López', avatar: 'https://i.pravatar.cc/150?u=3', points: 10890, level: 'Platino', trend: 'up', achievements: 10 },
  { id: '4', rank: 4, name: 'Carlos Ruiz', avatar: 'https://i.pravatar.cc/150?u=4', points: 9500, level: 'Oro', trend: 'down', achievements: 5 },
  { id: '5', rank: 5, name: 'Laura M.', avatar: 'https://i.pravatar.cc/150?u=5', points: 8200, level: 'Oro', trend: 'up', achievements: 7 },
  { id: '6', rank: 6, name: 'David K.', avatar: 'https://i.pravatar.cc/150?u=6', points: 7800, level: 'Oro', trend: 'stable', achievements: 4 },
  { id: '7', rank: 7, name: 'Sofia R.', avatar: 'https://i.pravatar.cc/150?u=7', points: 7100, level: 'Plata', trend: 'up', achievements: 6 },
];

const MOCK_LEVELS: Level[] = [
  { id: '1', name: 'Bronce', minPoints: 0, color: 'from-orange-700 to-orange-900', icon: Medal, benefits: ['Acceso a ofertas'], usersCount: 1250 },
  { id: '2', name: 'Plata', minPoints: 1000, color: 'from-gray-400 to-gray-600', icon: Medal, benefits: ['5% Descuento', 'Envío gratis > 50€'], usersCount: 850 },
  { id: '3', name: 'Oro', minPoints: 5000, color: 'from-yellow-400 to-yellow-600', icon: Crown, benefits: ['10% Descuento', 'Regalo cumpleaños', 'Acceso anticipado'], usersCount: 320 },
  { id: '4', name: 'Platino', minPoints: 10000, color: 'from-cyan-400 to-cyan-600', icon: Trophy, benefits: ['15% Descuento', 'Envío gratis siempre', 'Soporte VIP'], usersCount: 45 },
];

const POINTS_HISTORY_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Día ${i + 1}`,
  points: Math.floor(Math.random() * 5000) + 2000,
  redemptions: Math.floor(Math.random() * 1000) + 100,
}));

// --- Components ---

const PointsChart = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={POINTS_HISTORY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F76934" stopOpacity={0.3} />
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
        <Area type="monotone" dataKey="points" name="Puntos Otorgados" stroke="#F76934" fillOpacity={1} fill="url(#colorPoints)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const Podium = ({ topThree }: { topThree: LeaderboardUser[] }) => {
  return (
    <div className="flex justify-center items-end gap-4 mb-8 pt-4">
      {/* 2nd Place */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Avatar src={topThree[1].avatar} alt={topThree[1].name} size="lg" className="border-4 border-gray-400" fallback={topThree[1].name} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">2</div>
        </div>
        <div className="text-center mb-2">
           <p className="font-bold text-white text-sm">{topThree[1].name}</p>
           <p className="text-xs text-brand-orange font-mono">{topThree[1].points.toLocaleString()} pts</p>
        </div>
        <div className="w-20 h-24 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-lg flex items-end justify-center pb-2 border-t border-gray-600">
           <Medal className="text-gray-400 w-8 h-8 opacity-50" />
        </div>
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500"><Crown size={24} fill="currentColor" /></div>
          <Avatar src={topThree[0].avatar} alt={topThree[0].name} size="xl" className="border-4 border-yellow-500 ring-4 ring-yellow-500/20" fallback={topThree[0].name} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">1</div>
        </div>
        <div className="text-center mb-2">
           <p className="font-bold text-white text-base">{topThree[0].name}</p>
           <p className="text-sm text-brand-orange font-mono">{topThree[0].points.toLocaleString()} pts</p>
        </div>
        <div className="w-24 h-32 bg-gradient-to-t from-yellow-900/80 to-yellow-800/80 rounded-t-lg flex items-end justify-center pb-4 border-t border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
           <Trophy className="text-yellow-500 w-10 h-10" />
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Avatar src={topThree[2].avatar} alt={topThree[2].name} size="lg" className="border-4 border-orange-700" fallback={topThree[2].name} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</div>
        </div>
        <div className="text-center mb-2">
           <p className="font-bold text-white text-sm">{topThree[2].name}</p>
           <p className="text-xs text-brand-orange font-mono">{topThree[2].points.toLocaleString()} pts</p>
        </div>
        <div className="w-20 h-20 bg-gradient-to-t from-orange-950 to-orange-900 rounded-t-lg flex items-end justify-center pb-2 border-t border-orange-800">
           <Medal className="text-orange-700 w-8 h-8 opacity-50" />
        </div>
      </div>
    </div>
  );
};

const GamificationStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card className="p-4 bg-[#2C2C2C] border-white/5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Trophy size={64} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-brand-orange/10 text-brand-orange">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Puntos Totales</p>
          <p className="text-2xl font-bold text-white font-display">1.2M</p>
          <span className="text-xs text-green-400 flex items-center gap-1">+12% vs mes anterior</span>
        </div>
      </div>
    </Card>
    <Card className="p-4 bg-[#2C2C2C] border-white/5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Users size={64} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Jugadores Activos</p>
          <p className="text-2xl font-bold text-white font-display">3,450</p>
          <span className="text-xs text-green-400 flex items-center gap-1">+5% nuevos esta semana</span>
        </div>
      </div>
    </Card>
    <Card className="p-4 bg-[#2C2C2C] border-white/5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Target size={64} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Retos Completados</p>
          <p className="text-2xl font-bold text-white font-display">85%</p>
          <span className="text-xs text-text-muted">Tasa de finalización</span>
        </div>
      </div>
    </Card>
    <Card className="p-4 bg-[#2C2C2C] border-white/5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Star size={64} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Nivel Promedio</p>
          <p className="text-2xl font-bold text-white font-display">Plata</p>
          <span className="text-xs text-text-muted">Mayoría de usuarios</span>
        </div>
      </div>
    </Card>
  </div>
);

export default function GamificationDashboard() {
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  
  // Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    title: '', description: '', reward: 100, type: 'daily', status: 'active', icon: '🎯'
  });

  // Rewards State
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardSearchTerm, setRewardSearchTerm] = useState('');
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<string>('all');
  const [rewardSortBy, setRewardSortBy] = useState<'points' | 'date'>('points');

  const handleCreateChallenge = () => {
    if (!newChallenge.title) return;
    const challenge: Challenge = {
      id: Math.random().toString(36).substr(2, 9),
      title: newChallenge.title || 'Nuevo Reto',
      description: newChallenge.description || '',
      reward: newChallenge.reward || 0,
      type: newChallenge.type as any || 'daily',
      status: newChallenge.status as any || 'active',
      icon: newChallenge.icon || '🎯',
      progress: 0,
      participants: 0
    };
    setChallenges([...challenges, challenge]);
    setIsChallengeModalOpen(false);
    setNewChallenge({ title: '', description: '', reward: 100, type: 'daily', status: 'active', icon: '🎯' });
  };

  const handleDeleteChallenge = (id: string) => {
    setChallenges(challenges.filter(c => c.id !== id));
  };

  // Rewards Functions
  const loadRewards = async () => {
    try {
      setRewardsLoading(true);
      const allRewards = await getAllRewards();
      setRewards(allRewards);
    } catch (err) {
      console.error('Error loading rewards:', err);
    } finally {
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    // Load rewards when component mounts or when rewards tab might be accessed
    loadRewards();
  }, []);

  const handleCreateNewReward = () => {
    setEditingReward({
      id: '',
      title: '',
      description: '',
      pointsRequired: 0,
      isActive: true,
      category: 'general',
      createdAt: new Date().toISOString(),
    });
    setIsRewardModalOpen(true);
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward({ ...reward });
    setIsRewardModalOpen(true);
  };

  const handleSaveReward = async () => {
    if (!editingReward || !editingReward.title || editingReward.pointsRequired === undefined) {
      return;
    }

    try {
      if (editingReward.id) {
        await updateReward(editingReward.id, editingReward);
      } else {
        await createReward(editingReward as Omit<Reward, 'id' | 'createdAt'>);
      }
      await loadRewards();
      setIsRewardModalOpen(false);
      setEditingReward(null);
    } catch (err) {
      console.error('Error saving reward:', err);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta recompensa?')) {
      return;
    }

    try {
      await deleteReward(id);
      await loadRewards();
    } catch (err) {
      console.error('Error deleting reward:', err);
    }
  };

  const filteredLeaderboard = MOCK_LEADERBOARD.filter(user => 
    user.name.toLowerCase().includes(leaderboardSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-display">
            <Gamepad2 className="w-8 h-8 text-brand-orange" />
            Centro de Gamificación
          </h1>
          <p className="text-text-secondary mt-1">Gestiona la experiencia de lealtad, retos y recompensas de tu comunidad.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" className="gap-2">
               <BarChart3 className="w-4 h-4"/> Analytics
            </Button>
            <Button className="gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white">
               <Plus className="w-4 h-4"/> Nueva Campaña
            </Button>
        </div>
      </div>

      <GamificationStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
         <Card className="lg:col-span-2 bg-[#2C2C2C] border-white/5">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand-orange" /> 
                  Dinámica de Puntos (30 días)
               </CardTitle>
            </CardHeader>
            <CardContent>
               <PointsChart />
            </CardContent>
         </Card>
         <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/40 to-[#2C2C2C] border-purple-500/20">
               <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 ring-4 ring-purple-500/10">
                     <Crown className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Nivel Platino</h3>
                  <p className="text-sm text-gray-400 mb-4">El nivel más deseado. Solo el 1.2% de los usuarios lo han alcanzado.</p>
                  <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">Gestionar Beneficios</Button>
               </CardContent>
            </Card>
            <Card className="bg-[#2C2C2C] border-white/5">
               <CardHeader className="pb-2"><CardTitle className="text-base">Retos Populares</CardTitle></CardHeader>
               <CardContent className="space-y-3">
                  {challenges.slice(0, 3).map(c => (
                     <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                        <span className="text-2xl">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-white truncate">{c.title}</p>
                           <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5">
                              <div className="bg-brand-orange h-1.5 rounded-full" style={{ width: `${c.progress}%` }} />
                           </div>
                        </div>
                        <span className="text-xs font-mono text-text-secondary">{c.progress}%</span>
                     </div>
                  ))}
               </CardContent>
            </Card>
         </div>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-[#2C2C2C] p-1 border border-white/5">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white/10">
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
            </TabsTrigger>
            <TabsTrigger value="levels" className="data-[state=active]:bg-white/10">
                <Crown className="w-4 h-4 mr-2" />
                Niveles
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-white/10">
                <Target className="w-4 h-4 mr-2" />
                Retos
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-white/10">
                <Medal className="w-4 h-4 mr-2" />
                Medallas
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Reglas
            </TabsTrigger>
            </TabsList>
        </div>

        {/* --- Leaderboard Tab --- */}
        <TabsContent value="leaderboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Podium topThree={MOCK_LEADERBOARD.slice(0, 3)} />
            
            <Card className="bg-[#2C2C2C] border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar usuario..." 
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            value={leaderboardSearch}
                            onChange={(e) => setLeaderboardSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" className="text-text-secondary"><Filter className="w-4 h-4 mr-2"/> Filtros</Button>
                </div>
                <Table>
                    <TableHeader className="bg-[#1A1A1A]">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Rank</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Nivel</TableHead>
                            <TableHead>Logros</TableHead>
                            <TableHead className="text-right">Puntos Totales</TableHead>
                            <TableHead className="w-[100px] text-center">Tendencia</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeaderboard.map((user) => (
                            <TableRow key={user.id} className="hover:bg-white/5 transition-colors border-white/5">
                                <TableCell className="text-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto ${
                                        user.rank === 1 ? 'bg-yellow-500 text-black' :
                                        user.rank === 2 ? 'bg-gray-300 text-black' :
                                        user.rank === 3 ? 'bg-orange-600 text-white' :
                                        'bg-white/5 text-gray-500'
                                    }`}>
                                        {user.rank}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar src={user.avatar} alt={user.name} fallback={user.name.substring(0,2)} />
                                        <span className="text-white font-medium">{user.name}</span>
                                        {user.rank <= 3 && <Crown size={14} className="text-yellow-500" />}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="default" className="bg-white/10 hover:bg-white/20">{user.level}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                                        <Medal size={14} className="text-purple-400" /> {user.achievements}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-brand-orange font-bold">
                                    {user.points.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    {user.trend === 'up' && <div className="flex items-center justify-center text-green-500 bg-green-500/10 rounded p-1 w-8 mx-auto"><TrendingUp size={14} /></div>}
                                    {user.trend === 'down' && <div className="flex items-center justify-center text-red-500 bg-red-500/10 rounded p-1 w-8 mx-auto"><TrendingUp size={14} className="rotate-180" /></div>}
                                    {user.trend === 'stable' && <span className="text-gray-600">-</span>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </TabsContent>

        {/* --- Niveles Tab --- */}
        <TabsContent value="levels" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_LEVELS.map(level => (
                    <Card key={level.id} className={`relative overflow-hidden border-0 h-full group`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        
                        <div className="p-6 relative z-10 flex flex-col h-full">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                <level.icon className="w-8 h-8 text-white" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-1 font-display">{level.name}</h3>
                            <p className="text-sm text-text-secondary mb-4 flex items-center gap-1">
                               <Target size={14}/> Desde {level.minPoints.toLocaleString()} pts
                            </p>
                            
                            <div className="flex-1">
                                <ul className="space-y-3 mb-6">
                                    {level.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                            <Check className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                                            <span className="leading-tight">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-white/10 mt-auto">
                                <div className="flex justify-between text-xs text-text-secondary mb-2">
                                    <span>Usuarios</span>
                                    <span>{level.usersCount}</span>
                                </div>
                                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${level.color}`} style={{ width: `${(level.usersCount / 2500) * 100}%` }} />
                                </div>
                                <Button variant="ghost" size="sm" className="mt-4 w-full border border-white/10 hover:bg-white/10 hover:text-white">
                                    Editar Nivel
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                <Card className="p-6 flex flex-col items-center justify-center border-2 border-dashed border-white/10 bg-transparent hover:border-brand-orange/50 hover:bg-white/5 cursor-pointer transition-all group min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-brand-orange/20">
                        <Plus className="w-8 h-8 text-gray-400 group-hover:text-brand-orange" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 group-hover:text-white mb-2">Crear Nuevo Nivel</h3>
                    <p className="text-sm text-gray-600 text-center max-w-[200px] group-hover:text-gray-400">Define un nuevo hito y sus beneficios exclusivos.</p>
                </Card>
            </div>
        </TabsContent>

        {/* --- Retos Tab --- */}
        <TabsContent value="challenges" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">Retos Activos</h2>
             <Button onClick={() => setIsChallengeModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              Crear Reto
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(challenge => (
              <Card key={challenge.id} className="relative group hover:border-brand-orange/50 transition-all hover:-translate-y-1 bg-[#2C2C2C] border-white/5 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-orange/50 group-hover:bg-brand-orange transition-colors" />
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-4xl bg-white/5 p-3 rounded-2xl shadow-inner">{challenge.icon}</div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={challenge.status === 'active' ? 'success' : 'default'} className="text-[10px] px-2 py-0.5 uppercase tracking-wider">
                                {challenge.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                             <button 
                                onClick={() => handleDeleteChallenge(challenge.id)}
                                className="text-gray-600 hover:text-red-500 transition-colors p-1"
                                >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-white text-xl mb-2">{challenge.title}</h3>
                    <p className="text-sm text-text-secondary mb-6 min-h-[40px]">{challenge.description}</p>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end text-sm">
                            <span className="text-text-secondary">Progreso Global</span>
                            <span className="text-white font-bold">{challenge.progress}%</span>
                        </div>
                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-orange h-full rounded-full transition-all duration-1000" style={{ width: `${challenge.progress}%` }} />
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-gray-400"/>
                                <span className="text-xs text-gray-400">{challenge.participants} participantes</span>
                            </div>
                            <div className="flex items-center gap-1 bg-brand-orange/10 px-3 py-1 rounded-lg border border-brand-orange/20">
                                <Star size={12} className="text-brand-orange" fill="currentColor"/>
                                <span className="text-xs font-bold text-brand-orange">+{challenge.reward} pts</span>
                            </div>
                        </div>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* --- Medallas Tab --- */}
        <TabsContent value="badges">
            <BadgeEditor /> 
        </TabsContent>

        {/* --- Recompensas Tab --- */}
        <TabsContent value="rewards" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Recompensas Disponibles</h2>
            <Button onClick={handleCreateNewReward} leftIcon={<Plus className="w-4 h-4" />} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              Nueva Recompensa
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-[#2C2C2C] border-white/5">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar recompensas..."
                    value={rewardSearchTerm}
                    onChange={(e) => setRewardSearchTerm(e.target.value)}
                    className="pl-9 bg-[#1A1A1A]"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    options={[
                      { value: 'all', label: 'Todas las categorías' },
                      { value: 'general', label: 'General' },
                      { value: 'descuentos', label: 'Descuentos' },
                      { value: 'productos', label: 'Productos' },
                    ]}
                    value={rewardCategoryFilter}
                    onChange={(val) => setRewardCategoryFilter(val)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    options={[
                      { value: 'points', label: 'Ordenar por puntos' },
                      { value: 'date', label: 'Ordenar por fecha' },
                    ]}
                    value={rewardSortBy}
                    onChange={(val) => setRewardSortBy(val as any)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards List */}
          {rewardsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                let filtered = rewards.filter(reward => {
                  const matchesSearch = reward.title.toLowerCase().includes(rewardSearchTerm.toLowerCase()) ||
                                       reward.description?.toLowerCase().includes(rewardSearchTerm.toLowerCase());
                  const matchesCategory = rewardCategoryFilter === 'all' || reward.category === rewardCategoryFilter;
                  return matchesSearch && matchesCategory;
                });

                if (rewardSortBy === 'points') {
                  filtered = [...filtered].sort((a, b) => a.pointsRequired - b.pointsRequired);
                } else {
                  filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }

                return filtered.length > 0 ? (
                  filtered.map(reward => (
                    <Card key={reward.id} className="relative group hover:border-brand-orange/50 transition-all hover:-translate-y-1 bg-[#2C2C2C] border-white/5 overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${reward.isActive ? 'bg-green-500' : 'bg-gray-500'} group-hover:bg-brand-orange transition-colors`} />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-4xl bg-white/5 p-3 rounded-2xl shadow-inner">
                            {reward.icon || reward.iconName || '🎁'}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={reward.isActive ? 'success' : 'default'} className="text-[10px] px-2 py-0.5 uppercase tracking-wider">
                              {reward.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                            <button 
                              onClick={() => handleDeleteReward(reward.id)}
                              className="text-gray-600 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-white text-xl mb-2">{reward.title}</h3>
                        <p className="text-sm text-text-secondary mb-4 min-h-[40px]">{reward.description || 'Sin descripción'}</p>
                        
                        {reward.category && (
                          <Badge className="mb-4 bg-blue-500/20 text-blue-400">
                            {reward.category}
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-1 bg-brand-orange/10 px-3 py-1.5 rounded-lg border border-brand-orange/20">
                            <Star size={14} className="text-brand-orange" fill="currentColor"/>
                            <span className="text-sm font-bold text-brand-orange">{reward.pointsRequired} pts</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditReward(reward)}
                            className="text-white hover:text-brand-orange"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full">
                    <Card className="bg-[#2C2C2C] border-white/5">
                      <CardContent className="p-12 text-center">
                        <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No se encontraron recompensas</p>
                        <Button onClick={handleCreateNewReward} variant="outline">
                          Crear Primera Recompensa
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        {/* --- Reglas Tab --- */}
        <TabsContent value="rules">
            <RulesConfig />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Reward Modal */}
      <Modal isOpen={isRewardModalOpen} onClose={() => { setIsRewardModalOpen(false); setEditingReward(null); }}>
        <div className="w-[600px] max-w-[95vw] bg-[#1E1E1E]">
          <ModalHeader className="border-b border-white/5 bg-[#2C2C2C] py-4">
            <span className="font-display text-xl">{editingReward?.id ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}</span>
          </ModalHeader>
          <ModalBody className="p-6">
            {editingReward && (
              <div className="space-y-6">
                <Input
                  label="Título de la Recompensa *"
                  value={editingReward.title}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  placeholder="Ej. Descuento 10%"
                  className="bg-[#1A1A1A]"
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Descripción</label>
                  <textarea
                    value={editingReward.description || ''}
                    onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                    placeholder="Describe la recompensa..."
                    rows={3}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Puntos Requeridos *"
                    type="number"
                    value={editingReward.pointsRequired?.toString() || '0'}
                    onChange={(e) => setEditingReward({ ...editingReward, pointsRequired: parseInt(e.target.value) || 0 })}
                    className="bg-[#1A1A1A]"
                  />
                  <Select
                    label="Categoría"
                    options={[
                      { value: 'general', label: 'General' },
                      { value: 'descuentos', label: 'Descuentos' },
                      { value: 'productos', label: 'Productos' },
                    ]}
                    value={editingReward.category || 'general'}
                    onChange={(val) => setEditingReward({ ...editingReward, category: val })}
                  />
                </div>
                <Input
                  label="Icono (emoji o nombre)"
                  value={editingReward.icon || editingReward.iconName || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, icon: e.target.value, iconName: e.target.value })}
                  placeholder="🎁 o gift"
                  className="bg-[#1A1A1A]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingReward.isActive}
                    onChange={(e) => setEditingReward({ ...editingReward, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-[#252525] text-brand-orange focus:ring-brand-orange"
                  />
                  <label className="text-gray-300">Recompensa Activa</label>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t border-white/5 bg-[#2C2C2C] py-4">
            <Button variant="ghost" onClick={() => { setIsRewardModalOpen(false); setEditingReward(null); }}>Cancelar</Button>
            <Button onClick={handleSaveReward} className="bg-brand-orange hover:bg-brand-orange/90 text-white">Guardar Recompensa</Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Create Challenge Modal */}
      <Modal isOpen={isChallengeModalOpen} onClose={() => setIsChallengeModalOpen(false)}>
        <div className="w-[600px] max-w-[95vw] bg-[#1E1E1E]">
            <ModalHeader className="border-b border-white/5 bg-[#2C2C2C] py-4">
                <span className="font-display text-xl">Crear Nuevo Reto</span>
            </ModalHeader>
            <ModalBody className="p-6">
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 items-start">
                    <div className="col-span-1">
                         <label className="block text-sm font-medium text-text-secondary mb-2">Icono</label>
                         <div className="h-24 w-full bg-[#1A1A1A] border border-white/10 rounded-xl flex items-center justify-center text-4xl relative group cursor-pointer hover:border-brand-orange/50 transition-colors">
                            {newChallenge.icon}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                                <Edit2 size={16} className="text-white"/>
                            </div>
                         </div>
                    </div>
                    <div className="col-span-3 space-y-4">
                         <Input
                            label="Título del Reto"
                            value={newChallenge.title}
                            onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                            placeholder="Ej. Maratón de Compras"
                            className="bg-[#1A1A1A]"
                        />
                        <Input
                            label="Descripción Corta"
                            value={newChallenge.description}
                            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                            placeholder="Describe el objetivo claramente..."
                            className="bg-[#1A1A1A]"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Recompensa (Puntos)"
                        type="number"
                        value={newChallenge.reward}
                        onChange={(e) => setNewChallenge({ ...newChallenge, reward: Number(e.target.value) })}
                        className="bg-[#1A1A1A]"
                    />
                    <Select
                        label="Frecuencia"
                        options={[
                            { value: 'daily', label: 'Diario' },
                            { value: 'weekly', label: 'Semanal' },
                            { value: 'monthly', label: 'Mensual' },
                            { value: 'milestone', label: 'Hito Único' },
                        ]}
                        value={newChallenge.type}
                        onChange={(val) => setNewChallenge({ ...newChallenge, type: val as any })}
                    />
                </div>
                
                <div className="p-4 bg-brand-orange/5 rounded-lg border border-brand-orange/10 flex gap-3 items-start">
                    <Star className="text-brand-orange shrink-0 mt-1" size={16} />
                    <p className="text-xs text-brand-orange/80 leading-relaxed">
                        Al crear este reto, los usuarios recibirán una notificación push automáticamente si tienen las alertas activadas.
                    </p>
                </div>
            </div>
            </ModalBody>
            <ModalFooter className="border-t border-white/5 bg-[#2C2C2C] py-4">
            <Button variant="ghost" onClick={() => setIsChallengeModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateChallenge} className="bg-brand-orange hover:bg-brand-orange/90 text-white">Crear Reto</Button>
            </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
