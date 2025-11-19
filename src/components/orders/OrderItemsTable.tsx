import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table/Table';
import { OrderItem } from '../../types/core';
import { formatCurrency } from '../../utils/formatters';
import { Package } from 'lucide-react';

export interface OrderItemsTableProps {
  items: (OrderItem & { image?: string; variantName?: string })[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
}

export default function OrderItemsTable({ items, totals }: OrderItemsTableProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#1E1E1E] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-white/10">
            <TableHead className="w-[80px]">Producto</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-center">Cant.</TableHead>
            <TableHead className="text-right">Precio Unit.</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.productId}-${item.variantId || 'base'}`} className="hover:bg-white/5 border-white/5">
              <TableCell>
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-white/20" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{item.name}</span>
                  {item.variantName && (
                    <span className="text-xs text-text-secondary">
                      {item.variantName}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-text-secondary">
                  {item.sku}
                </span>
              </TableCell>
              <TableCell className="text-center font-medium text-white">
                {item.quantity}
              </TableCell>
              <TableCell className="text-right text-text-secondary">
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right font-medium text-white">
                {formatCurrency(item.totalPrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-white/5 border-t border-white/10">
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={4} />
            <TableCell className="text-right text-text-secondary">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-medium text-white">
              {formatCurrency(totals.subtotal)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={4} />
            <TableCell className="text-right text-text-secondary">
              Envío
            </TableCell>
            <TableCell className="text-right font-medium text-white">
              {formatCurrency(totals.shipping)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={4} />
            <TableCell className="text-right text-text-secondary">
              Impuestos
            </TableCell>
            <TableCell className="text-right font-medium text-white">
              {formatCurrency(totals.tax)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={4} />
            <TableCell className="text-right text-emerald-400">
              Descuento
            </TableCell>
            <TableCell className="text-right font-medium text-emerald-400">
              -{formatCurrency(totals.discount)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent border-t border-white/10 bg-white/5">
            <TableCell colSpan={4} />
            <TableCell className="text-right font-bold text-white text-lg">
              TOTAL GRAN
            </TableCell>
            <TableCell className="text-right font-bold text-white text-lg">
              {formatCurrency(totals.total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
