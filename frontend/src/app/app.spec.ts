import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './common/api-error';

describe('apiErrorMessage', () => {
  it('returns a readable message from the API response', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: 'Horario ocupado' } });
    expect(apiErrorMessage(error, 'Error')).toBe('Horario ocupado');
  });

  it('joins validation messages and falls back when no message exists', () => {
    const validationError = new HttpErrorResponse({ status: 400, error: { message: ['Campo requerido', 'Formato inválido'] } });
    expect(apiErrorMessage(validationError, 'Error')).toBe('Campo requerido. Formato inválido');
    expect(apiErrorMessage(new Error('fallo'), 'Error genérico')).toBe('Error genérico');
  });
});
