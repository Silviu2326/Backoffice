import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table/Table';
import Button from './Button';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: PaginationProps;
}

const DataTableSkeleton = ({ columns, rowCount = 5 }: { columns: number; rowCount?: number }) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

const EmptyState = ({ colSpan }: { colSpan: number }) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
          <Inbox className="h-8 w-8 opacity-50" />
          <p>No hay datos disponibles</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export function DataTable<T>({
  data,
  columns,
  isLoading,
  pagination,
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-[#1E1E1E] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton
                columns={columns.length}
                rowCount={pagination?.pageSize || 5}
              />
            ) : data.length === 0 ? (
              <EmptyState colSpan={columns.length} />
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : column.accessorKey
                        ? (item[column.accessorKey] as React.ReactNode)
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-text-secondary">
            Página <span className="font-medium text-white">{pagination.page}</span> de{' '}
            <span className="font-medium text-white">{totalPages || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || isLoading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
