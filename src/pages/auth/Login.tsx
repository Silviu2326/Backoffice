import React from 'react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useLanguage } from '../../context/LanguageContext';

const Login: React.FC = () => {
  const { t } = useLanguage();

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
          <h2 className="text-3xl font-bold text-center text-gray-800">{t('login.welcome')}</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">{t('login.email')}</label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.email')}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('login.password')}</label>
              <Input
                id="password"
                type="password"
                placeholder={t('login.password')}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">{t('login.submit')}</Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            {t('login.helpText')}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
