import { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAKE_CREDENTIALS = {
  email: 'admin@mrcoolcat.com',
  password: 'coolcat123'
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email === FAKE_CREDENTIALS.email && password === FAKE_CREDENTIALS.password) {
        navigate('/');
      } else {
        setError('Credenciales incorrectas. Intenta con admin@mrcoolcat.com / coolcat123');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#2C2C2C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2C2C2C] rounded-[30px] shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F76934] to-[#FF8C42] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-4xl">😺</span>
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

            <div className="mt-6 p-4 bg-[#3A3A3A] rounded-[18px] border border-[#6366F1]/30">
              <p className="text-[#6366F1] text-xs font-semibold mb-2 text-center">CREDENCIALES DE PRUEBA</p>
              <p className="text-[#9CA3AF] text-xs text-center">Email: admin@mrcoolcat.com</p>
              <p className="text-[#9CA3AF] text-xs text-center">Password: coolcat123</p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#9CA3AF] text-xs">
              © 2024 Mr. CoolCat App. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
