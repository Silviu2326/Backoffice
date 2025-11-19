export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, style: 'short' | 'long' | 'relative'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Fecha inválida';
  }

  if (style === 'relative') {
    const now = new Date();
    const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });

    const cutoffs = [
      { unit: 'year', value: 31536000 },
      { unit: 'month', value: 2592000 },
      { unit: 'day', value: 86400 },
      { unit: 'hour', value: 3600 },
      { unit: 'minute', value: 60 },
      { unit: 'second', value: 1 },
    ] as const;

    for (const { unit, value } of cutoffs) {
      if (Math.abs(diffInSeconds) >= value) {
        return rtf.format(Math.round(diffInSeconds / value), unit);
      }
    }
    return rtf.format(0, 'second');
  }

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: style,
  }).format(d);
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);
}

export function generateInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
