export interface ClinicDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const dateTimeFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

export function getClinicDateTime(date: Date, timeZone: string): ClinicDateTime {
  const parts = dateTimeFormatter(timeZone).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));

  return {
    year: values['year'],
    month: values['month'],
    day: values['day'],
    hour: values['hour'],
    minute: values['minute'],
    second: values['second'],
  };
}

export function clinicDateString(date: Date, timeZone: string): string {
  const { year, month, day } = getClinicDateTime(date, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function clinicDateTimeToUtc(
  date: string,
  timeZone: string,
  hour = 0,
  minute = 0,
): Date {
  const [year, month, day] = date.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = target;

  // Resolve the timezone offset with Intl, including changes in daylight saving time.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = getClinicDateTime(new Date(candidate), timeZone);
    const representedAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    const difference = target - representedAsUtc;
    candidate += difference;
    if (difference === 0) break;
  }

  return new Date(candidate);
}

export function nextClinicDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`;
}
