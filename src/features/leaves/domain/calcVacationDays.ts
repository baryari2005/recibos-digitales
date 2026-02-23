export function calcVacationDays(
  fechaIngreso: Date,
  year = new Date().getFullYear()
): number {
  const endOfYear = new Date(year, 11, 31);

  // años completos al 31/12
  let years =
    endOfYear.getFullYear() - fechaIngreso.getFullYear();

  const anniversaryThisYear = new Date(
    year,
    fechaIngreso.getMonth(),
    fechaIngreso.getDate()
  );

  if (anniversaryThisYear > endOfYear) {
    years -= 1;
  }

  // menos de 6 meses
  const sixMonthsAfterEntry = new Date(fechaIngreso);
  sixMonthsAfterEntry.setMonth(sixMonthsAfterEntry.getMonth() + 6);

  if (sixMonthsAfterEntry > endOfYear) {
    return 0; // o lógica 1 cada 20 si querés
  }

  if (years < 5) return 14;
  if (years < 10) return 21;
  if (years < 20) return 28;
  return 35;
}
