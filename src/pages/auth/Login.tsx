import React from 'react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left 50% - Brand Image/Art */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 justify-center items-center">
        {/* Placeholder for 'CoolCat' brand image/art */}
        <div className="text-gray-500 text-2xl">CoolCat Brand Image/Art</div>
      </div>

      {/* Right 50% - Centered Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">Bienvenido de nuevo</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">Iniciar Sesión</Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            ¿Problemas de acceso? Contacta a IT
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
