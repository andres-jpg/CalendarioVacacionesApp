/**
 * Calcula los días de vacaciones que corresponden a un empleado según su fecha de ingreso
 * @param hireDate Fecha de ingreso del empleado
 * @param targetYear Año para el cual se calculan los días
 * @param defaultDaysPerYear Días de vacaciones por defecto al año
 * @returns Número de días de vacaciones (redondeado a 2 decimales)
 */
export function calculateVacationDays(
  hireDate: Date,
  targetYear: number,
  defaultDaysPerYear: number
): number {
  const hireYear = hireDate.getFullYear();

  if (hireYear < targetYear) {
    // Si ingresó en años anteriores, tiene días completos
    return defaultDaysPerYear;
  } else if (hireYear === targetYear) {
    // Si ingresó este año, calcular proporcionalmente por días
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31);

    // Días totales del año (365 o 366 si es bisiesto)
    const daysInYear = isLeapYear(targetYear) ? 366 : 365;

    // Días trabajados desde fecha de ingreso hasta fin de año
    const daysWorked = Math.ceil(
      (endOfYear.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Cálculo proporcional: (días_anuales / días_del_año) * días_trabajados
    const vacationDays = (defaultDaysPerYear / daysInYear) * daysWorked;

    return Math.round(vacationDays * 100) / 100; // Redondear a 2 decimales
  } else {
    // Si ingresará en el futuro, 0 días
    return 0;
  }
}

/**
 * Determina si un año es bisiesto
 * @param year Año a verificar
 * @returns true si es bisiesto, false en caso contrario
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Calcula el balance total de días de vacaciones disponibles
 * @param daysFromPreviousYear Días pendientes del año anterior
 * @param daysCurrentYear Días que corresponden al año actual
 * @param daysTaken Días ya disfrutados en el año actual
 * @returns Balance de días disponibles
 */
export function calculateAvailableBalance(
  daysFromPreviousYear: number,
  daysCurrentYear: number,
  daysTaken: number
): number {
  return daysFromPreviousYear + daysCurrentYear - daysTaken;
}

/**
 * Calcula los días de vacaciones devengados hasta una fecha concreta.
 * Para años pasados devuelve el total del año (ya devengado por completo).
 * Para el año en curso aplica prorrateo desde la fecha efectiva de inicio.
 * Para años futuros devuelve 0.
 *
 * @param hireDate Fecha de ingreso del empleado
 * @param targetYear Año del cálculo
 * @param daysCurrentYear Días asignados para ese año (ya almacenados en vacation_balance)
 * @param today Fecha de referencia (normalmente la fecha actual)
 * @returns Días devengados hasta `today` (redondeados a 2 decimales)
 */
export function calculateAccruedToDate(
  hireDate: Date,
  targetYear: number,
  daysCurrentYear: number,
  today: Date
): number {
  const todayYear = today.getFullYear();

  // Año pasado → ya está todo devengado
  if (todayYear > targetYear) return daysCurrentYear;

  // Año futuro → todavía no empieza a devengar
  if (todayYear < targetYear) return 0;

  // Año en curso ─────────────────────────────────────────────────
  const startOfYear = new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31);

  // El empleado empieza a devengar desde su fecha de alta o el 1 de enero,
  // lo que sea más tardío
  const effectiveStart = hireDate > startOfYear ? hireDate : startOfYear;

  // Días totales del periodo que le corresponden en este año
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysEntitled = Math.ceil((endOfYear.getTime() - effectiveStart.getTime()) / msPerDay) + 1;

  if (daysEntitled <= 0) return 0;

  // No contar más allá del fin de año
  const cutoff = today < endOfYear ? today : endOfYear;
  const daysWorkedToDate = Math.max(
    0,
    Math.ceil((cutoff.getTime() - effectiveStart.getTime()) / msPerDay) + 1
  );

  const accrued = (daysCurrentYear / daysEntitled) * daysWorkedToDate;
  return Math.round(accrued * 100) / 100;
}
