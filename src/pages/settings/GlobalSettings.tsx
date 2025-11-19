import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ShieldCheck } from 'lucide-react';

const GlobalSettings: React.FC = () => {
  const navigate = useNavigate();
  const [appName, setAppName] = useState('My Awesome App');
  const [contactEmail, setContactEmail] = useState('contact@example.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are undergoing scheduled maintenance. Please check back soon.');
  const [minClientVersionIos, setMinClientVersionIos] = useState('1.0.0');
  const [minClientVersionAndroid, setMinClientVersionAndroid] = useState('1.0.0');

  const handleSave = () => {
    // Logic to save settings
    console.log('Settings saved!');
    console.log({
      appName,
      contactEmail,
      maintenanceMode,
      maintenanceMessage,
      minClientVersionIos,
      minClientVersionAndroid,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Settings</h1>
          <p className="text-text-secondary mt-2">Manage application-wide configurations.</p>
        </div>
        <Button onClick={() => navigate('/settings/audit')} variant="outline" className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Audit Logs
        </Button>
      </div>

      {/* General Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">General</h2>
        <div className="mb-4">
          <label htmlFor="appName" className="block text-sm font-medium text-text-secondary mb-1">App Name</label>
          <Input
            id="appName"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Enter application name"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-text-secondary mb-1">Contact Email</label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Enter contact email"
          />
        </div>
      </Card>

      {/* Maintenance Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Maintenance</h2>
        <div className="flex items-center mb-4">
          <label htmlFor="maintenanceMode" className="block text-sm font-medium text-text-secondary mr-3">Maintenance Mode</label>
          <Button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`${maintenanceMode ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded transition-colors`}
          >
            {maintenanceMode ? 'ON' : 'OFF'}
          </Button>
        </div>
        {maintenanceMode && (
          <div className="mb-4">
            <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-text-secondary mb-1">Maintenance Message</label>
            <Input
              id="maintenanceMessage"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter maintenance message"
            />
          </div>
        )}
      </Card>

      {/* Versions Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Versions</h2>
        <div className="mb-4">
          <label htmlFor="minClientVersionIos" className="block text-sm font-medium text-text-secondary mb-1">Min Client Version (iOS)</label>
          <Input
            id="minClientVersionIos"
            value={minClientVersionIos}
            onChange={(e) => setMinClientVersionIos(e.target.value)}
            placeholder="e.g., 1.0.0"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="minClientVersionAndroid" className="block text-sm font-medium text-text-secondary mb-1">Min Client Version (Android)</label>
          <Input
            id="minClientVersionAndroid"
            value={minClientVersionAndroid}
            onChange={(e) => setMinClientVersionAndroid(e.target.value)}
            placeholder="e.g., 1.0.0"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default GlobalSettings;
