import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Filter,
  Gamepad2,
  TrendingUp,
  BarChart3,
  Loader2
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table/Table';
import { supabase } from '../../lib/supabase';



// --- Types ---


interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  level: string;
  trend: 'up' | 'down' | 'stable';
  achievements: number;
}


// --- Helper Functions ---


function getLevelByPoints(points: number): string {
  if (points >= 15000) return 'Diamante';
  if (points >= 10000) return 'Platino';
  if (points >= 5000) return 'Oro';
  if (points >= 2000) return 'Plata';
  return 'Bronce';
}

async function fetchLeaderboardData(): Promise<LeaderboardUser[]> {
  // Fetch user profiles with points
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, full_name, first_name, email, points_balance')
    .order('points_balance', { ascending: false })
    .limit(50);

  if (profilesError) {
    console.error('Error fetching user profiles:', profilesError);
    return [];
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Fetch achievements count per user
  const userIds = profiles.map(p => p.user_id);
  const { data: achievementsData, error: achievementsError } = await supabase
    .from('user_achievements')
    .select('user_id')
    .in('user_id', userIds)
    .not('unlocked_at', 'is', null);

  if (achievementsError) {
    console.error('Error fetching user achievements:', achievementsError);
  }

  // Count achievements per user
  const achievementsCount: Record<string, number> = {};
  if (achievementsData) {
    achievementsData.forEach(ua => {
      achievementsCount[ua.user_id] = (achievementsCount[ua.user_id] || 0) + 1;
    });
  }

  // Map to LeaderboardUser
  return profiles.map((profile, index) => ({
    id: profile.user_id,
    rank: index + 1,
    name: profile.full_name || profile.first_name || profile.email || 'Anónimo',
    points: profile.points_balance || 0,
    level: getLevelByPoints(profile.points_balance || 0),
    trend: 'stable' as const, // Could be calculated with historical data
    achievements: achievementsCount[profile.user_id] || 0,
  }));
}





// --- Components ---



const Podium = ({ topThree }: { topThree: LeaderboardUser[] }) => {
  return (
    <div className="flex justify-center items-end gap-4 mb-8 pt-4">
      {/* 2nd Place */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full bg-gray-600 border-4 border-gray-400 flex items-center justify-center text-white font-bold text-xl">
            {topThree[1].name.substring(0, 2).toUpperCase()}
          </div>
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
          <div className="w-20 h-20 rounded-full bg-yellow-900 border-4 border-yellow-500 ring-4 ring-yellow-500/20 flex items-center justify-center text-white font-bold text-2xl">
            {topThree[0].name.substring(0, 2).toUpperCase()}
          </div>
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
          <div className="w-16 h-16 rounded-full bg-orange-900 border-4 border-orange-700 flex items-center justify-center text-white font-bold text-xl">
            {topThree[2].name.substring(0, 2).toUpperCase()}
          </div>
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



export default function GamificationDashboard() {
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLeaderboardData();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('Error al cargar el ranking');
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(user =>
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
            <BarChart3 className="w-4 h-4" /> Analytics
          </Button>
          <Button className="gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white">
            Nueva Campaña
          </Button>
        </div>
      </div>





      <Tabs defaultValue="leaderboard" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-[#2C2C2C] p-1 border border-white/5">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white/10">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- Leaderboard Tab --- */}
        <TabsContent value="leaderboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
              <span className="ml-3 text-text-secondary">Cargando ranking...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500">
              {error}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <Trophy className="w-16 h-16 mb-4 opacity-30" />
              <p>No hay usuarios en el ranking todavía</p>
            </div>
          ) : (
            <>
              {leaderboard.length >= 3 && <Podium topThree={leaderboard.slice(0, 3)} />}

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
                  <Button variant="ghost" size="sm" className="text-text-secondary"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
                </div>
                <Table>
                  <TableHeader className="bg-[#1A1A1A]">
                    <TableRow>
                      <TableHead className="w-[80px] text-center">Rank</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Puntos Totales</TableHead>
                      <TableHead className="w-[100px] text-center">Tendencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaderboard.map((user) => (
                      <TableRow key={user.id} className="hover:bg-white/5 transition-colors border-white/5">
                        <TableCell className="text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto ${user.rank === 1 ? 'bg-yellow-500 text-black' :
                            user.rank === 2 ? 'bg-gray-300 text-black' :
                              user.rank === 3 ? 'bg-orange-600 text-white' :
                                'bg-white/5 text-gray-500'
                            }`}>
                            {user.rank}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{user.name}</span>
                            {user.rank <= 3 && <Crown size={14} className="text-yellow-500" />}
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
            </>
          )}
        </TabsContent>








      </Tabs>
    </div>
  );
}
