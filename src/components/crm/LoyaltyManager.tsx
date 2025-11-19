import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table/Table';
import { Plus, Minus, History } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoyaltyTransaction {
  id: string;
  date: string;
  concept: string;
  points: number;
}

const LoyaltyManager: React.FC = () => {
  const [pointsBalance, setPointsBalance] = useState(2500);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([
    { id: '1', date: '2023-10-25', concept: 'Compra en tienda', points: 150 },
    { id: '2', date: '2023-10-20', concept: 'Canje de premio', points: -500 },
    { id: '3', date: '2023-10-15', concept: 'Bono de cumpleaños', points: 1000 },
    { id: '4', date: '2023-10-10', concept: 'Compra online', points: 350 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustmentPoints, setAdjustmentPoints] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [error, setError] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setAdjustmentPoints('');
    setAdjustmentReason('');
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAdjustmentSubmit = () => {
    if (!adjustmentPoints || isNaN(Number(adjustmentPoints))) {
      setError('Por favor ingrese una cantidad válida de puntos.');
      return;
    }
    if (!adjustmentReason.trim()) {
      setError('El motivo es obligatorio.');
      return;
    }

    const points = Number(adjustmentPoints);
    const newTransaction: LoyaltyTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      concept: adjustmentReason,
      points: points,
    };

    setPointsBalance((prev) => prev + points);
    setHistory((prev) => [newTransaction, ...prev]);
    handleCloseModal();
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-brand-orange" />
            Gestión de Fidelidad
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleOpenModal} leftIcon={<Plus className="h-4 w-4" />}>
          Ajuste Manual
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col items-center justify-center rounded-xl bg-white/5 p-6 border border-white/10">
          <span className="text-sm text-text-secondary uppercase tracking-wider font-medium">Saldo Actual</span>
          <div className="mt-2 text-5xl font-display font-bold text-brand-orange">
            {pointsBalance.toLocaleString()}
          </div>
          <span className="text-sm text-text-muted mt-1">Puntos acumulados</span>
        </div>

        <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[120px]">Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Puntos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                        <TableRow key={item.id} className={cn(
                            "transition-colors hover:bg-white/5",
                            item.points > 0 ? "hover:bg-status-success/5" : "hover:bg-status-error/5"
                        )}>
                            <TableCell className="font-medium text-text-secondary">{item.date}</TableCell>
                            <TableCell>{item.concept}</TableCell>
                            <TableCell className={cn(
                                "text-right font-bold",
                                item.points > 0 ? "text-status-success" : "text-status-error"
                            )}>
                                {item.points > 0 ? '+' : ''}{item.points}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalHeader>Ajuste Manual de Puntos</ModalHeader>
        <ModalBody className="space-y-4">
            <div className="space-y-4">
                <Input
                    label="Puntos (+ para abonar, - para descontar)"
                    type="number"
                    placeholder="Ej. 100 o -50"
                    value={adjustmentPoints}
                    onChange={(e) => setAdjustmentPoints(e.target.value)}
                    error={error && !adjustmentPoints ? "Requerido" : undefined}
                />
                <Input
                    label="Motivo (Obligatorio)"
                    placeholder="Ej. Error en compra, Cortesía..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    error={error && !adjustmentReason ? "Requerido" : undefined}
                />
                {error && <p className="text-sm text-status-error">{error}</p>}
            </div>
        </ModalBody>
        <ModalFooter>
            <Button variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleAdjustmentSubmit}>Guardar Ajuste</Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default LoyaltyManager;
