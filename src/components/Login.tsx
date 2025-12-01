import { useState, useEffect } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import coolCatLogo from '../assets/image-removebg-preview.png';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#2C2C2C] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#2C2C2C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2C2C2C] rounded-[30px] shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <img src={coolCatLogo} alt="Mr. CoolCat Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold text-[#E5E5E7] mb-2">Mr. CoolCat</h1>
            <p className="text-[#9CA3AF] text-sm">Backoffice - Iniciar Sesión</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full bg-[#3A3A3A] text-[#E5E5E7] placeholder-[#9CA3AF] rounded-[18px] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full bg-[#3A3A3A] text-[#E5E5E7] placeholder-[#9CA3AF] rounded-[18px] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B] rounded-[18px] p-4">
                <p className="text-[#FF6B6B] text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F76934] to-[#FF8C42] text-white font-bold py-4 rounded-[18px] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-[#9CA3AF] text-xs">
              © 2025 Mr. CoolCat App. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
