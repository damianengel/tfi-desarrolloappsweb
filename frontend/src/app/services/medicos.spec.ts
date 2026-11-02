import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MedicosService } from './medicos';

describe('MedicosService', () => {
  let service: MedicosService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MedicosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
