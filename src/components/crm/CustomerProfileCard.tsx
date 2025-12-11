import React, { useState } from 'react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal, ModalHeader } from '../ui/Modal'; // Assuming a Modal component exists

interface CustomerProfileCardProps {
  customer: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    segments: string[];
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    avatar?: string;
    street?: string;
    number?: string;
    floor?: string;
    postalCode?: string;
    fullAddress?: string;
    language?: string;
  };
}

const CustomerProfileCard: React.FC<CustomerProfileCardProps> = ({ customer }) => {
  const [showBanModal, setShowBanModal] = useState(false);

  const handleResetPassword = () => {
    alert(`Enviando email de reseteo de contraseña a ${customer.email}`);
    // Implement actual email sending logic here
  };

  const handleBanUser = () => {
    console.log(`Baneando usuario con ID: ${customer.id}`);
    // Implement actual ban logic here
    setShowBanModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(customer.email);
    alert('Email copiado al portapapeles!');
  };

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-md text-white space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar src={customer.avatarUrl} alt={customer.name} size="xl" fallback={customer.name.substring(0, 2).toUpperCase()} />
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {customer.segments.map((segment) => (
              <Badge key={segment} variant="default">{segment}</Badge>
            ))}
          </div>
          {customer.avatar && (
            <p className="text-xs text-text-muted mt-1">
              Avatar: {customer.avatar}
            </p>
          )}
        </div>
      </div>

      {/* Información Personal */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold text-text-secondary">Información Personal</h3>

        {(customer.firstName || customer.lastName) && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {customer.firstName && (
              <div>
                <span className="text-text-muted">Nombre:</span>
                <p className="text-white">{customer.firstName}</p>
              </div>
            )}
            {customer.lastName && (
              <div>
                <span className="text-text-muted">Apellido:</span>
                <p className="text-white">{customer.lastName}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <p className="text-text-muted text-xs mb-1">ID Cliente:</p>
          <p className="text-xs font-mono text-text-secondary">{customer.id}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Input type="text" value={customer.email} readOnly className="flex-grow text-sm" />
          <Button onClick={copyToClipboard} variant="outline" size="sm">Copiar</Button>
        </div>

        {customer.phone && (
          <div>
            <span className="text-text-muted text-xs">Teléfono:</span>
            <p className="text-white text-sm">{customer.phone}</p>
          </div>
        )}

        {customer.language && (
          <div>
            <span className="text-text-muted text-xs">Idioma:</span>
            <p className="text-white text-sm">{customer.language === 'es' ? 'Español' : 'English'}</p>
          </div>
        )}
      </div>

      {/* Información de Dirección */}
      {(customer.fullAddress || customer.street || customer.city) && (
        <div className="space-y-2 pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-text-secondary">Dirección</h3>

          {customer.fullAddress ? (
            <p className="text-white text-sm">{customer.fullAddress}</p>
          ) : (
            <div className="text-sm space-y-1">
              {customer.street && (
                <p className="text-white">
                  {customer.street} {customer.number || ''}
                  {customer.floor && `, ${customer.floor}`}
                </p>
              )}
              {(customer.postalCode || customer.city) && (
                <p className="text-white">
                  {customer.postalCode && `${customer.postalCode} `}
                  {customer.city}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button onClick={handleResetPassword} variant="secondary" size="sm" className="flex-1">
          Reset Password
        </Button>
        <Button onClick={() => setShowBanModal(true)} variant="danger" size="sm" className="flex-1">
          Banear Usuario
        </Button>
      </div>

      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
      >
        <ModalHeader>Confirmar Baneo de Usuario</ModalHeader>
        <p className="mb-4">¿Estás seguro de que quieres banear a {customer.name}?</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowBanModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleBanUser}>Banear</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerProfileCard;
