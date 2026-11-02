import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  const message = error.error?.message;
  if (Array.isArray(message)) return message.join('. ');
  return typeof message === 'string' ? message : fallback;
}
