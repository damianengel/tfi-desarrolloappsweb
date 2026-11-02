const CLINIC_TIME_ZONE = 'America/Argentina/Buenos_Aires';

export function clinicDateInputValue(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values['year']}-${values['month']}-${values['day']}`;
}

export function formatClinicDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: CLINIC_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatClinicTime(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: CLINIC_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}
