import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table/Table';
import { Plus, History, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { 
  getLoyaltyHistory, 
  getCustomerPointsBalance, 
  addLoyaltyTransaction, 
  LoyaltyTransaction 
} from '../../features/crm/api/loyaltyService';
import { formatDate } from '../../utils/formatters';

interface LoyaltyManagerProps {
  customerId: string;
}

const LoyaltyManager: React.FC<LoyaltyManagerProps> = ({ customerId }) => {
  const [pointsBalance, setPointsBalance] = useState(0);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustmentPoints, setAdjustmentPoints] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLoyaltyData();
  }, [customerId]);

  const loadLoyaltyData = async () => {
    if (!customerId) return;
    try {
      setIsLoading(true);
      const [balance, transactions] = await Promise.all([
        getCustomerPointsBalance(customerId),
        getLoyaltyHistory(customerId)
      ]);
      setPointsBalance(balance);
      setHistory(transactions);
    } catch (err) {
      console.error('Error loading loyalty data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setAdjustmentPoints('');
    setAdjustmentReason('');
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAdjustmentSubmit = async () => {
    if (!adjustmentPoints || isNaN(Number(adjustmentPoints))) {
      setError('Por favor ingrese una cantidad válida de puntos.');
      return;
    }
    if (!adjustmentReason.trim()) {
      setError('El motivo es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      const points = Number(adjustmentPoints);
      
      await addLoyaltyTransaction(
        customerId,
        points,
        adjustmentReason,
        'manual_adjustment'
      );

      // Reload data to reflect changes (including trigger updates)
      await loadLoyaltyData();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error submitting adjustment:', err);
      setError(err.message || 'Error al guardar el ajuste. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center justify-center rounded-xl bg-white/5 p-6 border border-white/10">
              <span className="text-sm text-text-secondary uppercase tracking-wider font-medium">Saldo Actual</span>
              <div className="mt-2 text-5xl font-display font-bold text-brand-orange">
                {pointsBalance.toLocaleString()}
              </div>
              <span className="text-sm text-text-muted mt-1">Puntos acumulados</span>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[120px]">Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead className="text-right">Puntos</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-text-secondary py-4">
                              No hay historial de puntos
                            </TableCell>
                          </TableRow>
                        ) : (
                          history.map((item) => (
                              <TableRow key={item.id} className={cn(
                                  "transition-colors hover:bg-white/5",
                                  item.points > 0 ? "hover:bg-status-success/5" : "hover:bg-status-error/5"
                              )}>
                                  <TableCell className="font-medium text-text-secondary">
                                    {formatDate(new Date(item.createdAt), 'short')}
                                  </TableCell>
                                  <TableCell>{item.concept}</TableCell>
                                  <TableCell className={cn(
                                      "text-right font-bold",
                                      item.points > 0 ? "text-status-success" : "text-status-error"
                                  )}>
                                      {item.points > 0 ? '+' : ''}{item.points}
                                  </TableCell>
                              </TableRow>
                          ))
                        )}
                    </TableBody>
                </Table>
            </div>
          </>
        )}
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
            <Button variant="ghost" onClick={handleCloseModal} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleAdjustmentSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Ajuste'
              )}
            </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default LoyaltyManager;
