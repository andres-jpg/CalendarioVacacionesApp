import { format, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en formato legible en español
 * @param date Fecha a formatear
 * @param formatStr Formato deseado (por defecto: "dd/MM/yyyy")
 * @returns Fecha formateada
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Convierte una fecha a formato ISO para guardar en la BD
 * @param date Fecha a convertir
 * @returns Fecha en formato ISO (YYYY-MM-DD)
 */
export function toISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Parsea una fecha desde formato ISO
 * @param isoDate Fecha en formato ISO (YYYY-MM-DD)
 * @returns Objeto Date
 */
export function fromISODate(isoDate: string): Date {
  return parse(isoDate, 'yyyy-MM-dd', new Date());
}

/**
 * Obtiene el año actual
 * @returns Año actual
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Genera un array de años desde un año inicial hasta el actual + años futuros
 * @param startYear Año inicial
 * @param futureYears Años futuros a incluir (por defecto: 1)
 * @returns Array de años
 */
export function generateYearRange(startYear: number, futureYears: number = 1): number[] {
  const currentYear = getCurrentYear();
  const endYear = currentYear + futureYears;
  const years: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
}
