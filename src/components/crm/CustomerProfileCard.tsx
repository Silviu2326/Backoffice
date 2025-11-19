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
    <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-md text-white">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar src={customer.avatarUrl} alt={customer.name} size="xl" fallback={customer.name.substring(0, 2).toUpperCase()} />
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {customer.segments.map((segment) => (
              <Badge key={segment} variant="default">{segment}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-text-secondary mb-1">ID Cliente: {customer.id}</p>
        <div className="flex items-center space-x-2">
          <Input type="text" value={customer.email} readOnly className="flex-grow" />
          <Button onClick={copyToClipboard} variant="outline">Copiar</Button>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleResetPassword} variant="secondary">Reset Password</Button>
        <Button onClick={() => setShowBanModal(true)} variant="danger">Banear Usuario</Button>
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
