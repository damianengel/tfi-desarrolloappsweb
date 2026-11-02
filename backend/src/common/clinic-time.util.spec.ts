import {
  clinicDateString,
  clinicDateTimeToUtc,
  getClinicDateTime,
  nextClinicDate,
} from './clinic-time.util';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';

describe('clinic-time.util', () => {
  it('converts a clinic opening time to the correct UTC instant', () => {
    expect(clinicDateTimeToUtc('2026-11-05', TIME_ZONE, 10).toISOString())
      .toBe('2026-11-05T13:00:00.000Z');
  });

  it('formats dates in the clinic timezone and advances calendar days', () => {
    const date = new Date('2026-11-05T02:30:00.000Z');
    expect(clinicDateString(date, TIME_ZONE)).toBe('2026-11-04');
    expect(nextClinicDate('2026-11-30')).toBe('2026-12-01');
    expect(getClinicDateTime(new Date('2026-11-05T13:00:00.000Z'), TIME_ZONE).hour).toBe(10);
  });
});
